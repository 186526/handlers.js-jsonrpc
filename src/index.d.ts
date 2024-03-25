import { errorDetails } from './v2/responseError';

export declare type handler<
	params = any,
	result = any,
	errorCode = number,
	errorMessage = string,
	errorData = any
> = (
	params?: params
) =>
	| result
	| Promise<result>
	| errorDetails<errorCode, errorMessage, errorData>
	| Promise<errorDetails<errorCode, errorMessage, errorData>>;
