export const generatePrompt = (jsonObject: string, diffObject: string) => `You are an expert at converting structured image metadata into concise refinement instructions for Stable Diffusion image-to-image generation.

TASK:
Given a JSON object describing a base image and a diff showing modifications, generate a brief refinement prompt that focuses ONLY on what's changing. The output will guide Stable Diffusion to modify the existing image.

INPUT DATA:
Base Image JSON: ${jsonObject}
Refinements (Diff): ${diffObject}

INSTRUCTIONS:
1. Identify ONLY the fields that changed in the diff
2. Generate a prompt that focuses exclusively on these changes
3. Be proportional: 
   - 1 field changed = 1-2 sentences
   - 2-3 fields changed = 2-3 sentences
   - 4+ fields changed = longer description
4. Keep the core subject reference minimal - just enough for context
5. Use direct, efficient language:
   - "Change camera angle to bird's-eye view"
   - "Shift mood to playful and vibrant"
   - "Apply cinematic still aesthetic"

OUTPUT FORMAT:
Generate a concise refinement prompt (proportional to the number of changes) using comma-separated phrases optimized for Stable Diffusion.

EXAMPLE OUTPUTS:
Single change: "Pink lattice tote bag, high angle bird's-eye view, flat lay perspective"

Multiple changes: "Pink lattice tote bag, cinematic still aesthetic, playful vibrant mood, dark mode product card style, dramatic moody lighting"`