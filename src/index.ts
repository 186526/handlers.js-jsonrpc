import { router, route } from "handlers.js";
import * as handlersJS from "handlers.js";
import { handler } from "./index.d";
import { path, responder } from "handlers.js/dist/src/interface";

import * as v2 from "./v2";

const useResponse = (response: handlersJS.response<any>) => {
	response.headers.set("Content-Type", "application/json; charset=utf-8");
	response.status = 200;

	console.log(response);
};

export default class JSONRPCRouter<
	K = any,
	V = any,
	methods extends string = string,
	params = any,
	result = any,
	errorCode = number,
	errorMessage = string,
	errorData = any
> extends router<K, V> {
	private rpcHandlers: {
		[key in methods]: handler<
			params,
			result,
			errorCode,
			errorMessage,
			errorData
		>;
	} = {} as any;

	constructor(
		routes: route[] = [],
		rpcHandlers?: {
			[key in methods]: handler<
				params,
				result,
				errorCode,
				errorMessage,
				errorData
			>;
		}
	) {
		super(routes);

		if (rpcHandlers) {
			for (var x in rpcHandlers) {
				this.register(x, rpcHandlers[x]);
			}
		}
	}

	register(
		method: methods,
		handler: handler<params, result, errorCode, errorMessage, errorData>,
		ignoreRPCError: boolean = false
	) {
		if (method.startsWith("rpc.") && !ignoreRPCError) {
			throw new Error(
				'Method names starting with "rpc." are reserved for internal use'
			);
		}
		this.rpcHandlers[method] = handler;
	}

	enableList(): this {
		this.register(
			"rpc.list" as methods,
			async (): Promise<any> => Object.keys(this.rpcHandlers),
			true
		);
		return this;
	}

	_v2RPCsingleResponder = async (parsedJSONRPC: any) => {
		let responseJSONRPC: v2.response;

		if (parsedJSONRPC.jsonrpc !== "2.0")
			responseJSONRPC = new v2.responseError(parsedJSONRPC.id ?? null, {
				code: -32600,
				message: "Invalid Request",
				data: "JSONRPC version must be 2.0",
			});
		else if (!parsedJSONRPC.method)
			responseJSONRPC = new v2.responseError(parsedJSONRPC.id ?? null, {
				code: -32600,
				message: "Invalid Request",
				data: "JSONRPC method must be specified",
			});
		else if (typeof parsedJSONRPC.method !== "string")
			responseJSONRPC = new v2.responseError(parsedJSONRPC.id ?? null, {
				code: -32600,
				message: "Invalid Request",
				data: "JSONRPC method must be a string",
			});
		else {
			const JSONRPCRequest = new v2.request();

			JSONRPCRequest.id = parsedJSONRPC.id ?? null;
			JSONRPCRequest.method = parsedJSONRPC.method;
			if (parsedJSONRPC.params) JSONRPCRequest.params = parsedJSONRPC.params;

			if (
				!Object.keys(this.rpcHandlers).includes(JSONRPCRequest.method as string)
			)
				responseJSONRPC = new v2.responseError(JSONRPCRequest.id, {
					code: -32601,
					message: "Method not found",
					data: `Method ${JSONRPCRequest.method} not found`,
				});
			else
				responseJSONRPC = await v2.handler(
					this.rpcHandlers[JSONRPCRequest.method as methods]
				)(JSONRPCRequest);
		}
		if (parsedJSONRPC.id || responseJSONRPC instanceof v2.responseError)
			return responseJSONRPC;
		else return undefined;
	};

	v2RPCresponder: responder<K, V> = async (request, response) => {
		if (!response) response = new handlersJS.response("");

		let receivedJSONRPC: string = request.query.get("content") ?? request.body,
			parsedJSONRPC: any,
			answer: v2.response[] = [];
		try {
			parsedJSONRPC = JSON.parse(receivedJSONRPC);
		} catch (e) {
			let responseJSONRPC = new v2.responseError(null, {
				code: -32700,
				message: "Parse error",
				data: e.message,
			});

			response.body = responseJSONRPC.toString();
			useResponse(response);
			return response;
		}

		if (parsedJSONRPC instanceof Array) {
			answer = (
				await Promise.all(
					parsedJSONRPC.map(async (parsedSingleJSONRPC) => {
						return this._v2RPCsingleResponder(parsedSingleJSONRPC);
					})
				)
			).filter((item) => item !== undefined) as v2.response[];
		} else {
			const tmp = await this._v2RPCsingleResponder(parsedJSONRPC);
			if (tmp) answer.push(tmp);
		}

		if (answer.length > 1) response.body = JSON.stringify(answer);
		else if (answer.length == 1) response.body = JSON.stringify(answer[0]);

		useResponse(response);

		return response;
	};

	mount(path: path[] = ["/jsonrpc", "/jsonrpc/v2"]): this {
		path.forEach((k) =>
			this.binding(k, new handlersJS.handler("ANY", [this.v2RPCresponder]))
		);

		return this;
	}
}
