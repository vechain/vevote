import { VotedResult } from "@/types/votes";

export const calculateMostVoted = (
  results: VotedResult | undefined, 
  choiceIndex: number
): boolean => {
  if (!results?.data || results.data.length === 0) return false;

  const maxWeight = Math.max(...results.data.map(r => r.totalWeight));
  const choicesWithMaxWeight = results.data.filter(r => r.totalWeight === maxWeight);
  
  if (choicesWithMaxWeight.length === 1) {
    const currentChoice = results.data.find(r => r.choice === choiceIndex);
    return currentChoice?.totalWeight === maxWeight && maxWeight > 0;
  }
  
  const maxVoters = Math.max(...choicesWithMaxWeight.map(r => r.totalVoters));
  const currentChoice = results.data.find(r => r.choice === choiceIndex);
  
  return currentChoice?.totalWeight === maxWeight && 
         currentChoice?.totalVoters === maxVoters && 
         maxWeight > 0;
};