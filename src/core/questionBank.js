import { generate as generateAddition } from "./generators/addition.js";
import { generate as generateSubtraction } from "./generators/subtraction.js";
import { generate as generateMultiplication } from "./generators/multiplication.js";
import { generate as generateDivision } from "./generators/division.js";

function selectGenerator(operation) {
  switch (operation) {
    case "addition":
      return generateAddition;
    case "subtraction":
      return generateSubtraction;
    case "multiplication":
      return generateMultiplication;
    case "division":
      return generateDivision;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export function loadStage(stageJson) {
  const { rows, cols, operation, rank, preGenerated = [] } = stageJson;
  const need = (rows || 0) * (cols || 0);

  if (Array.isArray(preGenerated) && preGenerated.length >= need) {
    return preGenerated.slice(0, need);
  }

  const generator = selectGenerator(operation);
  return generator(rank, need);
}


