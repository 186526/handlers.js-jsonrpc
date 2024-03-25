import response from "./response";

export interface errorDetails<code = number, message = string, data = any> {
	code: -32700 | -32600 | -32601 | -32602 | -32603 | code;
	message:
		| "Parse error"
		| "Invalid Request"
		| "Method not found"
		| "Invalid params"
		| "Internal error"
		| message;
	data?: data;
}

export default class error<
	code = number,
	message = string,
	data = any
> extends response {
	protected errorPatch: errorDetails<code, message, data> = {
		code: -32603,
		message: "Internal error",
	};

	constructor(
		id?: string | number | null,
		error?: errorDetails<code, message, data>
	) {
		super(id);
		if (error) this.errorPatch = error;
	}

	get result() {
		throw new Error("Error response should not have a result.");
	}

	set result(values: any) {
		throw new Error("Error response should not have a result.");
	}

	get error(): errorDetails<code, message, data> {
		return this.errorPatch;
	}

	set error(values: errorDetails<code, message, data>) {
		this.errorPatch = values;
	}

	get code(): errorDetails<code, message, data>["code"] {
		return this.errorPatch.code;
	}

	set code(values: errorDetails<code, message, data>["code"]) {
		this.errorPatch.code = values;
	}

	get message(): errorDetails<code, message, data>["message"] {
		return this.errorPatch.message;
	}

	set message(values: errorDetails<code, message, data>["message"]) {
		this.errorPatch.message = values;
	}

	get data(): errorDetails<code, message, data>["data"] {
		return this.errorPatch.data;
	}

	set data(values: errorDetails<code, message, data>["data"]) {
		this.errorPatch.data = values;
	}

	hasErrorData(): boolean {
		return this.errorPatch.data !== undefined;
	}

	toString() {
		return JSON.stringify(
			Object.assign(
				{},
				error._object,
				{ id: this.patch.id },
				{ error: this.errorPatch }
			)
		);
	}
}
