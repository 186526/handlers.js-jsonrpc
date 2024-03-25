import { handler } from "../index.d";

import request from "./request";
import response from "./response";
import responseError from "./responseError";

const v2ToHandler = (
	handler: handler<any,any,any,any,any>
): ((request: request) => Promise<response>) => {
	return async (request: request): Promise<response> => {
		let params = request.params,
			answer: response = new response(),
			tmp;

		try {
			if (request.hasParams()) {
				tmp = await handler(params);
			} else {
				tmp = await handler();
			}
		} catch (e) {
			const answer = new responseError();
			if (request.id) answer.id = request.id;
			answer.code = -32603;
			answer.message = e.message;
			return answer;
		}
		if (tmp instanceof response) {
			answer = tmp;
		} else if (
			tmp instanceof Object &&
			Object.keys(tmp).includes("code") &&
			Object.keys(tmp).includes("message")
		) {
			let answer: responseError = new responseError();

			answer.code = tmp.code;
			answer.message = tmp.message;

			if (tmp.data) answer.data = tmp.data;
		} else {
			if (tmp) answer.result = tmp;
			else answer.result = null;
		}

		if (request.id) answer.id = request.id;
		return answer;
	};
};

export default v2ToHandler;
