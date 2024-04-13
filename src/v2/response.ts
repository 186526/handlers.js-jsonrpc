import jsonrpcBase from "./base";

export default class response<result = any> extends jsonrpcBase {
	declare patch: {
		id: string | number | null;
		result: result | null;
	};

	constructor(id?: string | number | null, result?: result) {
		super(id);
		if (result) this.result = result;
	}

	get result(): null | result {
		return this.patch.result;
	}

	set result(values: result) {
		this.patch.result = values;
	}
}
