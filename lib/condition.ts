export type ShuttleRunLine = "Geel" | "Blauw";
export type ShuttleRunGrade = "O" | "V" | "G";

export type ConditionInputs = {
	inzet: number | null;
	shuttleRunLine: ShuttleRunLine | null;
	shuttleRunTrap: number | null;
	rsgRunMinutes: number | null;
	rsgRunSeconds: number | null;
};

type CompleteConditionInputs = {
	inzet: number;
	shuttleRunLine: ShuttleRunLine;
	shuttleRunTrap: number;
	rsgRunMinutes: number;
	rsgRunSeconds: number;
};

export type ConditionResult = {
	shuttleRunGrade: ShuttleRunGrade;
	shuttleRunLevel: number;
	rsgRunLevel: number;
	limietenNiveau: number;
	eindniveau: number;
};

export function parseShuttleRunLine(value: unknown): ShuttleRunLine | null {
	return value === "Geel" || value === "Blauw" ? value : null;
}

export function parseShuttleRunTrap(value: unknown): number | null {
	if (typeof value !== "string" && typeof value !== "number") return null;
	if (typeof value === "string" && value.trim() === "") return null;

	const trap = Number(value);
	return Number.isFinite(trap) && trap >= 1 && Number.isInteger(trap * 2) ? trap : null;
}

export function getShuttleRunGrade(
	line: ShuttleRunLine | null,
	trap: number | null,
): ShuttleRunGrade | null {
	if (line === null || trap === null || !Number.isFinite(trap) || trap < 1) return null;

	if (!Number.isInteger(trap * 2)) return null;

	if (line === "Geel") {
		if (trap < 6) return "O";
		if (trap < 8) return "V";
		return "G";
	}

	if (trap < 7.5) return "O";
	if (trap < 10) return "V";
	return "G";
}

export function parseRsgRunTime(value: unknown): { minutes: number; seconds: number } | null {
	if (typeof value !== "string") return null;

	const match = value.trim().match(/^(\d+)\s*:\s*(\d{1,2})$/);
	if (!match) return null;

	const minutes = Number(match[1]);
	const seconds = Number(match[2]);
	return Number.isInteger(minutes) && Number.isInteger(seconds) && seconds <= 59
		? { minutes, seconds }
		: null;
}

export function hasConditionInput(input: ConditionInputs): boolean {
	return Object.values(input).some((value) => value !== null);
}

export function isValidConditionInput(input: ConditionInputs): boolean {
	return hasConditionInput(input)
		&& (input.inzet === null || (
			Number.isInteger(input.inzet)
			&& input.inzet >= 1
			&& input.inzet <= 4
		))
		&& (input.shuttleRunLine === null
			|| input.shuttleRunLine === "Geel"
			|| input.shuttleRunLine === "Blauw")
		&& (input.shuttleRunTrap === null
			|| (
				Number.isFinite(input.shuttleRunTrap)
				&& input.shuttleRunTrap >= 1
				&& Number.isInteger(input.shuttleRunTrap * 2)
			))
		&& (input.shuttleRunLine === null
			|| input.shuttleRunTrap === null
			|| getShuttleRunGrade(input.shuttleRunLine, input.shuttleRunTrap) !== null)
		&& (input.rsgRunMinutes === null || (
			Number.isInteger(input.rsgRunMinutes)
			&& input.rsgRunMinutes >= 0
		))
		&& (input.rsgRunSeconds === null || (
			Number.isInteger(input.rsgRunSeconds)
			&& input.rsgRunSeconds >= 0
			&& input.rsgRunSeconds <= 59
		));
}

export function isCompleteConditionInput(input: ConditionInputs): input is CompleteConditionInputs {
	return isValidConditionInput(input)
		&& input.inzet !== null
		&& input.shuttleRunLine !== null
		&& input.shuttleRunTrap !== null
		&& input.rsgRunMinutes !== null
		&& input.rsgRunSeconds !== null;
}

export function calculateConditionResult(
	inzet: number,
	shuttleRunLine: ShuttleRunLine,
	shuttleRunTrap: number,
	rsgRunMinutes: number,
	rsgRunSeconds: number,
): ConditionResult {
	const shuttleRunGrade = getShuttleRunGrade(shuttleRunLine, shuttleRunTrap);
	if (shuttleRunGrade === null) {
		throw new RangeError("Ongeldige Shuttle Run lijn of trap.");
	}

	const shuttleRunLevel = shuttleRunGrade === "O" ? 1 : shuttleRunGrade === "V" ? 2 : 3;

	const rsgRunDuration = rsgRunMinutes * 60 + rsgRunSeconds;
	const rsgRunLevel = rsgRunDuration >= 45 * 60
		? 1
		: rsgRunDuration >= 40 * 60
			? 2
			: rsgRunDuration >= 30 * 60
				? 3
				: 4;
	const limietenNiveau = (shuttleRunLevel + rsgRunLevel) / 2;

	return {
		shuttleRunGrade,
		shuttleRunLevel,
		rsgRunLevel,
		limietenNiveau,
		eindniveau: (inzet + limietenNiveau) / 2,
	};
}

export function getConditionGrade(eindniveau: number | null): "O" | "V" | "G" | null {
	if (eindniveau === null || !Number.isFinite(eindniveau)) return null;
	if (eindniveau < 2) return "O";
	if (eindniveau < 3) return "V";
	return "G";
}
