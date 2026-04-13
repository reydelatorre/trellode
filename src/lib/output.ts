export function out(data: unknown): void {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

export function fatal(msg: string, code = 1): never {
    process.stderr.write(`Error: ${msg}\n`);
    process.exit(code);
}
