declare class InStream extends Stream {
	constructor(file: string);
	read(): Promise<InStream>
}