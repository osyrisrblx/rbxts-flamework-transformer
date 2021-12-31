import chalk from "chalk";

interface Label {
	label: string;
	start: number;
}

export class Logger {
	public static debug = true;
	public static verbose = process.argv.includes("--verbose");

	static write(message: string) {
		process.stdout.write(message);
	}

	static writeLine(...messages: Array<unknown>) {
		if (!this.debug) return;

		for (const message of messages) {
			const text = typeof message === "string" ? `${message}` : `${JSON.stringify(message, undefined, "\t")}`;

			const flameworkPrefix = `[${chalk.gray("Flamework")}]: `;
			this.write(`${flameworkPrefix}${text.replace(/\n/g, `\n${flameworkPrefix}`)}\n`);
		}
	}

	static writeLineIfVerbose(...messages: Array<unknown>) {
		if (this.verbose) return this.writeLine(...messages);
	}

	static info(...messages: Array<unknown>) {
		this.writeLine(...messages.map((x) => chalk.blue(x)));
	}

	static infoIfVerbose(...messages: Array<unknown>) {
		if (this.verbose) return this.info(...messages);
	}

	static warn(...messages: Array<unknown>) {
		this.writeLine(...messages.map((x) => chalk.yellow(x)));
	}

	static warnIfVerbose(...messages: Array<unknown>) {
		if (this.verbose) return this.warn(...messages);
	}

	static error(...messages: Array<unknown>) {
		this.writeLine(...messages.map((x) => chalk.red(x)));
	}

	private static benchmarkLabels: Label[] = [];
	private static benchmarkOutput = "";
	static benchmark(label: string) {
		if (!this.debug) return;

		const depth = this.benchmarkLabels.length;
		this.benchmarkLabels.push({
			start: new Date().getTime(),
			label,
		});
		this.benchmarkOutput += `${"\t".repeat(depth)}Begin ${label}\n`;
	}

	static benchmarkEnd() {
		if (!this.debug) return;

		const label = this.benchmarkLabels.pop();
		const depth = this.benchmarkLabels.length;
		if (!label) throw new Error(`Unexpected benchmarkEnd()`);

		const timeDifference = new Date().getTime() - label.start;
		this.benchmarkOutput += `${"\t".repeat(depth)}End ${label.label} (${timeDifference}ms)\n`;

		if (depth === 0) {
			this.info(this.benchmarkOutput);
			this.benchmarkOutput = "";
		}
	}

	static {
		// Workaround for vscode PTY not having color highlighting.
		if (process.env.VSCODE_CWD !== undefined) {
			// ANSI 256
			chalk.level = 2;
		}
	}
}
