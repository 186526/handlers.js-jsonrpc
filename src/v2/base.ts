export default class jsonrpcBase {
	protected static _object: {
		jsonrpc: string;
		id: string | number | null;
	} = {
		jsonrpc: "2.0",
		id: null,
	};

	protected patch: { id: string | number | null } = {
		id: null,
	};

	constructor(id?: string | number | null) {
		if (id) this.id = id;
	}

	get id(): string | number | null {
		return this.patch.id;
	}

	set id(values: string | number | null) {
		this.patch.id = values;
	}

	toString() {
		return JSON.stringify(Object.assign({}, jsonrpcBase._object, this.patch));
	}

	get toJSON() {
		return () => JSON.parse(this.toString());
	}
}
