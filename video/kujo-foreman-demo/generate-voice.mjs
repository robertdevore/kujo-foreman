import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname);
const request = JSON.parse(await readFile(resolve(root, "narration.json"), "utf8"));
const output = resolve(root, "assets", "voice");
await mkdir(output, { recursive: true });

const key = process.env.ELEVENLABS_API_KEY || execFileSync(
  "security",
  ["find-generic-password", "-s", "kujo-videoops-elevenlabs", "-a", "videoops", "-w"],
  { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
).trim();
if (!key) throw new Error("ElevenLabs credential unavailable");

const receipts = [];
for (const cue of request.cues) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${request.voice.voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({
      text: cue.text,
      model_id: request.voice.modelId,
      voice_settings: {
        stability: 0.6,
        similarity_boost: 0.75,
        style: 0.12,
        use_speaker_boost: true,
      },
    }),
  });
  if (!response.ok) throw new Error(`ElevenLabs ${cue.id} failed with HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const target = resolve(output, `${cue.id}.mp3`);
  await writeFile(target, bytes);
  receipts.push({
    id: cue.id,
    provider: request.voice.provider,
    voice: request.voice.name,
    model: request.voice.modelId,
    inputSha256: createHash("sha256").update(cue.text).digest("hex"),
    audioSha256: createHash("sha256").update(bytes).digest("hex"),
    usage: "non-commercial hackathon submission",
    attributionRequired: true,
    generatedAt: new Date().toISOString(),
  });
}

await writeFile(resolve(output, "receipts.json"), `${JSON.stringify(receipts, null, 2)}\n`);
process.stdout.write(`Generated ${receipts.length} ElevenLabs cues.\n`);
