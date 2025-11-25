import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseAnswerCode(answerCode: string) {
  // input examples: "1&11&21", "10&20&30", "5&15&25"
  // output: "00A", "99J", "44E"

  const answers = answerCode.split("&")
  let result = ""

  if (answers.length !== 3) return result;

  result += (parseInt(answers[0]) - 1).toString()
  result += (parseInt(answers[1]) - 11).toString()
  result += String.fromCharCode(65 + parseInt(answers[2]) - 21) // 65 is 'A'

  return result
}