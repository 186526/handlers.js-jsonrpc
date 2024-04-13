# Handlers.js JSONRPC

Handlers.js JSONRPC is a Handlers.js router that's make a JSONRPC Server controller for Handlers.js.

---

## Usage

```typescript
import handlersJS from "handlers.js";
import JSONRPCRouter from "./dist";

const App = new handlersJS();

const router = new JSONRPCRouter([], {
	Add: ({ a, b }: { a: number; b: number }) => a + b,
	PromiseAdd: ({ a, b }: { a: number; b: number }) => a + b,
	ArraySum: (k: number[]) =>
		((k instanceof Array && k) || Object.values(k)).reduce((a, b) => a + b, 0),
});

router.enableList().mount();

App.use([router], "/(.*)");

App.useMappingAdapter();
App.listen(8080);
```
