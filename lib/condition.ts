export type ConditionInputs = {
	inzet: number | null;
	shuttleRunTrap: number | null;
	rsgRunMinutes: number | null;
	rsgRunSeconds: number | null;
};

type CompleteConditionInputs = {
	inzet: number;
	shuttleRunTrap: number;
	rsgRunMinutes: number;
	rsgRunSeconds: number;
};

export type ConditionResult = {
	shuttleRunLevel: number;
	rsgRunLevel: number;
	limietenNiveau: number;
	eindniveau: number;
};

export function parseShuttleRunTrap(value: unknown): number | null {
	if (typeof value !== "string" && typeof value !== "number") return null;
	if (typeof value === "string" && value.trim() === "") return null;

	const trap = Number(value);
	return Number.isFinite(trap) && trap > 0 ? trap : null;
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

export function isCompleteConditionInput(input: ConditionInputs): input is CompleteConditionInputs {
	return Number.isInteger(input.inzet)
		&& input.inzet !== null
		&& input.inzet >= 1
		&& input.inzet <= 4
		&& input.shuttleRunTrap !== null
		&& input.shuttleRunTrap > 0
		&& Number.isFinite(input.shuttleRunTrap)
		&& input.rsgRunMinutes !== null
		&& Number.isInteger(input.rsgRunMinutes)
		&& input.rsgRunMinutes >= 0
		&& input.rsgRunSeconds !== null
		&& Number.isInteger(input.rsgRunSeconds)
		&& input.rsgRunSeconds >= 0
		&& input.rsgRunSeconds <= 59;
}

export function calculateConditionResult(
	inzet: number,
	shuttleRunTrap: number,
	rsgRunMinutes: number,
	rsgRunSeconds: number,
): ConditionResult {
	const shuttleRunLevel = shuttleRunTrap <= 5
		? 1
		: shuttleRunTrap < 8
			? 2
			: shuttleRunTrap < 10
				? 3
				: 4;

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
