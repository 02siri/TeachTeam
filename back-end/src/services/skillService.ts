export const normalizeSkills = (skills: string[]): string[] => {
    return [...new Set(skills.map(s => s.trim().toLowerCase()))];
  };
  