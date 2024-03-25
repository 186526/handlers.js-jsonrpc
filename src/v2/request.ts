import jsonrpcBase from "./base";

export default class request<
	methods = string,
	params = any
> extends jsonrpcBase {
	declare patch: {
		id: string | number | null;
		method: methods | null;
		params?: params;
	};

	constructor(id?: string | number | null, method?: methods, params?: params) {
		super(id);
		if (method) this.method = method;
		if (params) this.params = params;
	}

	get method(): null | methods {
		return this.patch.method;
	}

	set method(values: methods) {
		this.patch.method = values;
	}

	get params(): params | undefined {
		return this.patch.params;
	}

	set params(values: params) {
		this.patch.params = values;
	}

	hasParams() {
		return this.params !== undefined;
	}
}
