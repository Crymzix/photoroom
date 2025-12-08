export const generatePrompt = (jsonObject: string, diffObject: string) => `You are an expert at converting structured image metadata into concise refinement instructions for Stable Diffusion image-to-image generation.

TASK:
Given a JSON object describing a base image and a diff showing modifications, generate a refinement prompt that describes HOW to transform the original image. The output will guide Stable Diffusion to modify the existing image while preserving its core elements.

INPUT DATA:
Base Image JSON: ${jsonObject}
Refinements (Diff): ${diffObject}

INSTRUCTIONS:
1. Analyze the "edited" fields in the diff to identify what's changing
2. Frame your output as modifications to the EXISTING image, not a new creation
3. Start by anchoring to the original subject/composition
4. Then describe the new stylistic/atmospheric qualities being applied
5. Use transformation language:
   - "Transform into...", "Adjust to...", "Refine with..."
   - "Apply [new mood/style]"
   - "Recontextualize as..."

6. Write in Stable Diffusion's format emphasizing the CHANGES:
   - Comma-separated phrases
   - Visual and specific
   - Focus on new qualities from the diff
   - Maintain subject continuity

OUTPUT FORMAT:
Generate a refinement prompt (75-125 words) that tells Stable Diffusion how to evolve the base image according to the diff, preserving the core elements while applying the specified changes.

EXAMPLE OUTPUT:
"Transform the vibrant green lattice-patterned tote bag into a cinematic still, apply playful energetic and vibrant atmosphere, recontextualize as dark mode mobile app product card aesthetic, maintain centered composition and sharp focus, refine with dramatic moody lighting, preserve woven plastic diamond grid pattern and eye-level angle, evolve into cinematic commercial photography style"`