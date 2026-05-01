import { useMemo, useState } from 'react'

const STEPS = [
  { id: 'brief', label: 'Brief' },
  { id: 'direction', label: 'Direction' },
  { id: 'references', label: 'References' },
  { id: 'review', label: 'Review' },
  { id: 'script', label: 'Script Plan' },
  { id: 'keyframes', label: 'Keyframes' },
  { id: 'videos', label: 'Videos' },
  { id: 'done', label: 'Queued' },
]

const FORMAT_OPTIONS = [
  { id: 'beauty_spot', label: 'Beauty Spot' },
  { id: 'product_demo', label: 'Product Demo' },
  { id: 'fashion_lifestyle', label: 'Lifestyle' },
  { id: 'tech_demo', label: 'Technical Demo' },
]

const PLATFORM_OPTIONS = [
  { id: 'vertical_9x16', label: '9:16' },
  { id: 'landscape_16x9', label: '16:9' },
  { id: 'square_1x1', label: '1:1' },
]

const OUTPUT_ASPECT_RATIO_OPTIONS = [
  { id: 'vertical_9x16', label: '9:16', helper: 'Portrait: 720x1280 or 1080x1920.' },
  { id: 'landscape_16x9', label: '16:9', helper: 'Landscape: 1280x720 or 1920x1080.' },
]

const TONE_OPTIONS = [
  { id: 'premium-calm', label: 'Premium Calm', text: 'premium calm' },
  { id: 'social-fast', label: 'Social Fast', text: 'fast social' },
  { id: 'emotional-cinematic', label: 'Emotional', text: 'emotional cinematic' },
  { id: 'technical-clean', label: 'Technical', text: 'technical clean' },
]

const VIDEO_MODEL_OPTIONS = [
  { id: 'ltx23-i2v', label: 'LTX 2.3', helper: 'Default. Good for people-heavy shots and longer takes.' },
  { id: 'wan22-i2v', label: 'WAN 2.2', helper: 'Good alternate for product motion and physical demo shots.' },
]

const SHOT_COUNT_OPTIONS = [3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
const COMMERCIAL_LENGTH_OPTIONS = [6, 15, 30, 60]
const RESOLUTION_OPTIONS = [
  { id: '720p', label: '720p' },
  { id: '1080p', label: '1080p' },
]
const FPS_OPTIONS = [24, 25, 30]

function getSuggestedShotCount(length) {
  const seconds = Number(length) || 30
  if (seconds <= 6) return 3
  if (seconds <= 15) return 6
  if (seconds <= 30) return 10
  return 20
}

function getShotHint(length) {
  const seconds = Number(length) || 30
  if (seconds <= 6) return 'Suggested: 2-4 shots for a 6 second ad.'
  if (seconds <= 15) return 'Suggested: 4-8 shots for a 15 second ad.'
  if (seconds <= 30) return 'Suggested: 8-12 shots for a 30 second ad.'
  return 'Suggested: 16-24 shots for a 60 second ad.'
}

function formatShotTime(index, count, totalSeconds) {
  const start = Math.round((index * totalSeconds) / count)
  const end = Math.round(((index + 1) * totalSeconds) / count)
  return `${start}-${Math.max(end, start + 1)}s`
}

function getShotDuration(count, totalSeconds) {
  const duration = Math.max(2, Math.min(5, Number(totalSeconds || 30) / Math.max(1, Number(count) || 1)))
  return Number(duration.toFixed(1))
}

function resolveOutputResolution(platform, resolutionPreset) {
  const is1080 = resolutionPreset === '1080p'
  if (platform === 'landscape_16x9') {
    return is1080 ? { width: 1920, height: 1080 } : { width: 1280, height: 720 }
  }
  if (platform === 'square_1x1') {
    return is1080 ? { width: 1080, height: 1080 } : { width: 720, height: 720 }
  }
  return is1080 ? { width: 1080, height: 1920 } : { width: 720, height: 1280 }
}

function formatResolutionLabel(resolution) {
  if (!resolution) return ''
  return `${resolution.width}x${resolution.height}`
}

function getAssetUrl(asset) {
  return asset?.url || asset?.thumbnailUrl || asset?.proxyUrl || asset?.path || ''
}

function compact(text, fallback) {
  const value = String(text || '').replace(/\s+/g, ' ').trim()
  return value || fallback
}

function buildShotTemplates(data) {
  const brandProduct = compact(`${data.brand} ${data.product}`, 'the product')
  const audience = compact(data.audience, 'the target customer')
  const promise = compact(data.promise, 'the main product benefit')
  const colors = compact(data.colors, 'clean brand colors')
  const talentMode = data.noVisibleTalent ? 'none' : 'lifestyle model'
  const talentLine = data.noVisibleTalent
    ? 'Talent mode: none'
    : `Talent mode: ${talentMode}`

  return [
    {
      title: 'Hook: show the problem',
      adBeat: 'hook',
      productMode: 'context',
      shotType: 'Close-up',
      keyframe: `Single commercial keyframe of ${audience} experiencing the problem ${brandProduct} solves, ${colors}, no text.`,
      motion: `Start from the keyframe and show a clear problem moment with ${data.toneText} pacing.`,
      camera: 'Subtle push-in',
    },
    {
      title: 'Product reveal',
      adBeat: 'product reveal',
      productMode: 'hero',
      shotType: 'Hero product',
      keyframe: `Premium hero product shot of ${brandProduct}, readable shape and packaging, ${colors}, no text.`,
      motion: 'Slow reveal motion, keep the product centered and readable.',
      camera: 'Slow dolly in',
    },
    {
      title: 'Texture and benefit',
      adBeat: 'demo',
      productMode: 'macro detail',
      shotType: 'Macro close-up',
      keyframe: `Macro detail showing texture, material, formula, or finish for ${data.product}, premium lighting, no text.`,
      motion: `Gentle macro movement that visually supports: ${promise}.`,
      camera: 'Locked macro with micro push-in',
    },
    {
      title: 'Product in use',
      adBeat: 'demo',
      productMode: 'in-hand',
      shotType: 'Medium close-up',
      keyframe: `Natural use moment for ${brandProduct}, believable scale, ${talentLine.toLowerCase()}, ${colors}, no text.`,
      motion: 'Show the product being used clearly and naturally.',
      camera: 'Handheld but controlled',
    },
    {
      title: 'Lifestyle proof',
      adBeat: 'proof',
      productMode: 'lifestyle',
      shotType: 'Medium shot',
      keyframe: `Lifestyle proof moment for ${audience}, product visible, aspirational but believable, no text.`,
      motion: `Show the payoff feeling after using the product: ${promise}.`,
      camera: 'Smooth tracking shot',
    },
    {
      title: 'Benefit beat',
      adBeat: 'benefit',
      productMode: 'hero',
      shotType: 'Insert shot',
      keyframe: `Clean visual proof of the core benefit for ${brandProduct}, simple composition with space for editor-native overlay, no rendered text.`,
      motion: `Hold on the benefit visual long enough to read the story: ${promise}.`,
      camera: 'Locked insert with slight parallax',
    },
    {
      title: 'Talent reaction',
      adBeat: 'testimonial',
      productMode: 'lifestyle',
      shotType: 'Medium close-up',
      keyframe: data.noVisibleTalent
        ? `Hands-only product moment for ${brandProduct}, no visible face, clean background, no text.`
        : `Natural talent reaction after using ${brandProduct}, wardrobe and identity consistent with reference, no text.`,
      motion: data.noVisibleTalent
        ? 'Hands interact with the product naturally, no face visible.'
        : 'Talent gives a subtle satisfied reaction, no exaggerated acting.',
      camera: 'Gentle handheld close-up',
    },
    {
      title: 'Product detail proof',
      adBeat: 'proof',
      productMode: 'macro detail',
      shotType: 'Close-up',
      keyframe: `Detailed premium product proof shot for ${brandProduct}, label or form clear, no text.`,
      motion: 'Slow motion across the product detail, keep packaging consistent.',
      camera: 'Lateral slider move',
    },
    {
      title: 'Usage context',
      adBeat: 'demo',
      productMode: 'context',
      shotType: 'Medium wide',
      keyframe: `Believable setting where ${audience} would use ${brandProduct}, product present and easy to understand, no text.`,
      motion: 'Show the product naturally in its use environment.',
      camera: 'Slow pan',
    },
    {
      title: 'CTA setup',
      adBeat: 'CTA',
      productMode: 'packshot',
      shotType: 'Locked packshot',
      keyframe: `Clean packshot setup for ${brandProduct}, generous negative space for editor-native CTA text, no rendered text.`,
      motion: 'Hold steady so the final CTA can be added in the editor.',
      camera: 'Locked packshot',
      endCard: `${data.brand || 'Brand'}, ${data.product || 'Product'}, Learn more`,
    },
    {
      title: 'Alternate product angle',
      adBeat: 'proof',
      productMode: 'packaging',
      shotType: 'Three-quarter product',
      keyframe: `Three-quarter angle of ${brandProduct}, product shape and packaging readable, clean background, no text.`,
      motion: 'Subtle orbit that keeps the product readable.',
      camera: 'Small orbit',
    },
    {
      title: 'Before/after suggestion',
      adBeat: 'proof',
      productMode: 'result',
      shotType: 'Split-free proof shot',
      keyframe: `Tasteful single-frame result suggestion for ${promise}, no split screen, no before-after collage, no text.`,
      motion: 'Move from problem detail into result feeling without a split screen.',
      camera: 'Slow push-in',
    },
    {
      title: 'Material detail',
      adBeat: 'proof',
      productMode: 'macro detail',
      shotType: 'Extreme close-up',
      keyframe: `Extreme close-up of product material, formula, texture, finish, or packaging detail for ${brandProduct}, no text.`,
      motion: 'Premium macro movement across the material detail.',
      camera: 'Macro slider',
    },
    {
      title: 'Brand moment',
      adBeat: 'brand',
      productMode: 'hero',
      shotType: 'Wide product composition',
      keyframe: `Brand-forward composition for ${brandProduct}, ${colors}, premium commercial lighting, no text.`,
      motion: 'Slow cinematic camera move that reinforces brand feeling.',
      camera: 'Slow crane or dolly',
    },
    {
      title: 'Customer moment',
      adBeat: 'lifestyle',
      productMode: 'lifestyle',
      shotType: 'Medium shot',
      keyframe: `Relatable customer moment for ${audience}, product in scene, natural environment, no text.`,
      motion: 'Natural lifestyle movement, product remains visible.',
      camera: 'Steady handheld',
    },
    {
      title: 'Problem callback',
      adBeat: 'problem',
      productMode: 'context',
      shotType: 'Close-up',
      keyframe: `Clean callback to the original problem, now with ${brandProduct} as the clear solution, no text.`,
      motion: 'Show the transition from problem to product solution.',
      camera: 'Subtle rack focus',
    },
    {
      title: 'Trust cue',
      adBeat: 'proof',
      productMode: 'label',
      shotType: 'Insert shot',
      keyframe: `Subtle trust cue for ${brandProduct}: clean label, routine, texture, or careful use detail, no text.`,
      motion: 'Small motion that makes the trust cue easy to read visually.',
      camera: 'Locked insert',
    },
    {
      title: 'Secondary benefit',
      adBeat: 'benefit',
      productMode: 'hero',
      shotType: 'Close-up',
      keyframe: `Secondary benefit visual for ${brandProduct}, supports ${promise}, clean composition, no text.`,
      motion: 'Short visual beat supporting the main product promise.',
      camera: 'Gentle push-in',
    },
    {
      title: 'Use case',
      adBeat: 'demo',
      productMode: 'in-use',
      shotType: 'Medium close-up',
      keyframe: `Clear use case shot for ${brandProduct}, understandable action, believable scale, no text.`,
      motion: 'Show one simple action from start to finish.',
      camera: 'Controlled handheld',
    },
    {
      title: 'End card hold',
      adBeat: 'end card',
      productMode: 'packshot',
      shotType: 'Locked packshot',
      keyframe: `Final clean packshot for ${brandProduct}, product centered, safe empty space for editor-native text, no rendered text.`,
      motion: 'Hold steady for final brand impression.',
      camera: 'Locked packshot',
      endCard: `${data.brand || 'Brand'}, ${data.product || 'Product'}, Shop now`,
    },
    {
      title: 'Packaging close-up',
      adBeat: 'proof',
      productMode: 'packaging',
      shotType: 'Close-up',
      keyframe: `Close-up product packaging shot for ${brandProduct}, readable form and label area, no text.`,
      motion: 'Slow glide across packaging, no fake typography.',
      camera: 'Slider close-up',
    },
    {
      title: 'Emotional payoff',
      adBeat: 'payoff',
      productMode: 'lifestyle',
      shotType: 'Wide shot',
      keyframe: `Emotional payoff moment for ${audience}, product story feels complete, premium commercial style, no text.`,
      motion: 'Slow cinematic payoff movement.',
      camera: 'Wide slow push',
    },
    {
      title: 'Final reminder',
      adBeat: 'CTA',
      productMode: 'hero',
      shotType: 'Hero product',
      keyframe: `Final reminder shot of ${brandProduct}, simple brand-safe composition, no rendered text.`,
      motion: 'Short restrained product hero motion.',
      camera: 'Subtle dolly',
    },
    {
      title: 'Logo-safe finish',
      adBeat: 'end card',
      productMode: 'packshot',
      shotType: 'Locked packshot',
      keyframe: `Logo-safe final frame for ${brandProduct}, clean negative space for native end card typography, no text in image.`,
      motion: 'Hold steady with very subtle light movement.',
      camera: 'Locked end card',
      endCard: `${data.brand || 'Brand'}, ${data.product || 'Product'}, Try it today`,
    },
  ]
}

function buildDirectorScript(data) {
  const shotCount = Math.max(3, Math.min(Number(data.shotCount) || 8, 24))
  const shotDuration = getShotDuration(shotCount, data.commercialLength)
  const shots = buildShotTemplates(data).slice(0, shotCount)
  return [
    `Scene 1: ${compact(data.brand, 'Brand')} ${compact(data.product, 'Product')} Commercial`,
    `Scene context: ${compact(data.formatLabel, 'Product ad')} for ${compact(data.audience, 'the target audience')}. Visual rules: ${compact(data.colors, 'clean brand colors')}. Tone: ${compact(data.toneText, 'premium calm')}.`,
    '',
    ...shots.map((shot, index) => [
      `Shot ${index + 1}: ${shot.title}`,
      `Ad beat: ${shot.adBeat}`,
      `Product mode: ${shot.productMode}`,
      `Talent mode: ${data.noVisibleTalent ? 'none' : shot.talentMode || 'lifestyle model'}`,
      `Shot type: ${shot.shotType}`,
      `Keyframe prompt: ${shot.keyframe}`,
      `Motion prompt: ${shot.motion}`,
      `Camera: ${shot.camera}`,
      index === 0 ? `Text overlay: ${compact(data.promise, 'Main benefit')}` : '',
      shot.endCard ? `End card: ${shot.endCard}` : '',
      `Duration: ${shotDuration}`,
    ].filter(Boolean).join('\n')),
  ].join('\n\n')
}

function buildExternalLlmPrompt(data, currentScript) {
  return [
    'Write a ComfyStudio Director Mode product ad script using this exact structure.',
    '',
    'Return only the script. Do not include explanation, markdown, or notes.',
    '',
    `Brand: ${compact(data.brand, 'Brand')}`,
    `Product: ${compact(data.product, 'Product')}`,
    `Audience: ${compact(data.audience, 'target customer')}`,
    `Promise: ${compact(data.promise, 'main product benefit')}`,
    `Visual rules: ${compact(data.colors, 'clean brand colors')}`,
    `Format: ${compact(data.formatLabel, 'Product Ad')}`,
    `Platform: ${compact(data.platform, 'vertical_9x16')}`,
    `Tone: ${compact(data.toneText, 'premium calm')}`,
    `Commercial length: ${Number(data.commercialLength) || 30} seconds`,
    `Shot count: ${Number(data.shotCount) || 8}`,
    `Output resolution: ${data.resolutionLabel}`,
    `Frames per second: ${Number(data.videoFps) || 24} fps`,
    `Talent: ${data.noVisibleTalent ? 'No visible talent' : compact(data.talentDirection, 'Use talent only where it helps the product story')}`,
    '',
    'Required structure for every shot:',
    'Shot N: Short title',
    'Ad beat: hook | product reveal | demo | proof | benefit | CTA | end card',
    'Product mode: hero | macro detail | in-hand | lifestyle | packshot | packaging | result',
    'Talent mode: none | hand model | lifestyle model | spokesperson | testimonial',
    'Shot type: close-up / medium shot / wide shot / packshot / insert / macro',
    'Keyframe prompt: one still image prompt, no rendered text',
    'Motion prompt: image-to-video motion from that exact keyframe',
    'Camera: simple camera movement',
    'Duration: 2 to 5 seconds',
    '',
    'Rules:',
    '- Use one block per shot.',
    '- Keep prompts visually specific and production-ready.',
    '- Do not ask ComfyStudio to render text into images. Reserve space for editor-native text instead.',
    '- Avoid split screens, collages, storyboard grids, before/after panels, watermarks, captions, random letters, and fake typography.',
    '- Keep product packaging and talent identity consistent with references when references are available.',
    '- Avoid overpromising claims.',
    '',
    'Current editable script draft to improve or follow:',
    '',
    currentScript || buildDirectorScript(data),
  ].join('\n')
}

function flattenPlanShots(plan) {
  const rows = []
  for (const scene of plan || []) {
    for (const shot of scene?.shots || []) {
      rows.push({ scene, shot })
    }
  }
  return rows
}

export default function AdEasyMode({
  assets,
  yoloActivePlan,
  yoloQueueVariants,
  yoloStoryboardAssetMap,
  yoloStoryboardReadyCount,
  yoloDefaultVideoWorkflowId,
  yoloDependencyCheckInProgress,
  yoloScript,
  setYoloScript,
  setYoloStyleNotes,
  setYoloAdBrandName,
  setYoloAdProductName,
  setYoloAdColorPalette,
  setYoloAdLogoConstraints,
  setYoloAdSpokespersonRole,
  setYoloAdWardrobeNotes,
  setYoloAdProductAssetId,
  setYoloAdModelAssetId,
  setYoloAdFormatPreset,
  setYoloAdPlatformPreset,
  setYoloAdStoryboardSource,
  setYoloAdStoryboardTier,
  setYoloAdVideoSource,
  setYoloAdVideoTier,
  setYoloAdLocalVideoWorkflowId,
  setYoloTargetDuration,
  setYoloShotsPerScene,
  setYoloAnglesPerShot,
  setYoloTakesPerAngle,
  setYoloVideoFps,
  setResolution,
  setImageResolution,
  handleBuildActiveYoloPlan,
  handleQueueYoloStoryboards,
  handleQueueYoloShotStoryboard,
  handleQueueYoloVideos,
  handleQueueYoloShotVideo,
  handleYoloShotImageBeatChange,
  handleYoloShotVideoBeatChange,
  handleYoloShotTakesChange,
}) {
  const [step, setStep] = useState('brief')
  const [brand, setBrand] = useState('Gold Bond')
  const [product, setProduct] = useState('Dry Skin Relief Lotion')
  const [colors, setColors] = useState('Natural neutral colors, warm bathroom light')
  const [audience, setAudience] = useState('People with dry winter skin who want fast relief')
  const [promise, setPromise] = useState('Soft, healthy-looking skin without a greasy finish.')
  const [talentDirection, setTalentDirection] = useState('')
  const [format, setFormat] = useState('beauty_spot')
  const [platform, setPlatform] = useState('vertical_9x16')
  const [tone, setTone] = useState('premium-calm')
  const [resolutionPreset, setResolutionPreset] = useState('720p')
  const [videoFps, setVideoFps] = useState(24)
  const [commercialLength, setCommercialLength] = useState(30)
  const [shotCount, setShotCount] = useState(8)
  const [videoWorkflowId, setVideoWorkflowId] = useState('ltx23-i2v')
  const [productAssetId, setProductAssetId] = useState('')
  const [talentAssetId, setTalentAssetId] = useState('')
  const [noVisibleTalent, setNoVisibleTalent] = useState(false)
  const [directorScript, setDirectorScript] = useState(yoloScript || '')
  const [selectedShotIndex, setSelectedShotIndex] = useState(0)
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0)
  const [keyframeStatus, setKeyframeStatus] = useState('Ready to generate one keyframe.')
  const [videoStatus, setVideoStatus] = useState('Ready to generate one video.')
  const [llmCopyStatus, setLlmCopyStatus] = useState('')

  const imageAssets = useMemo(() => (assets || []).filter((asset) => asset?.type === 'image'), [assets])
  const videoAssetMap = useMemo(() => {
    const map = new Map()
    for (const asset of assets || []) {
      if (asset?.type !== 'video' || asset?.yolo?.stage !== 'video') continue
      if (asset?.yolo?.mode === 'music') continue
      if (asset?.yolo?.variantKey) map.set(asset.yolo.variantKey, asset)
      if (asset?.yolo?.key) map.set(asset.yolo.key, asset)
    }
    return map
  }, [assets])
  const planShots = useMemo(() => flattenPlanShots(yoloActivePlan), [yoloActivePlan])

  const selectedTone = TONE_OPTIONS.find((option) => option.id === tone) || TONE_OPTIONS[0]
  const selectedFormat = FORMAT_OPTIONS.find((option) => option.id === format) || FORMAT_OPTIONS[0]
  const selectedVideoWorkflow = VIDEO_MODEL_OPTIONS.find((option) => option.id === videoWorkflowId) || VIDEO_MODEL_OPTIONS[0]
  const outputResolution = useMemo(
    () => resolveOutputResolution(platform, resolutionPreset),
    [platform, resolutionPreset]
  )
  const outputResolutionLabel = formatResolutionLabel(outputResolution)

  const currentData = {
    brand,
    product,
    colors,
    audience,
    promise,
    talentDirection,
    format,
    formatLabel: selectedFormat.label,
    platform,
    tone,
    toneText: selectedTone.text,
    resolutionPreset,
    resolutionLabel: outputResolutionLabel,
    videoFps,
    commercialLength,
    shotCount,
    noVisibleTalent,
  }

  const generatedScript = useMemo(() => buildDirectorScript(currentData), [
    brand,
    product,
    colors,
    audience,
    promise,
    talentDirection,
    format,
    platform,
    tone,
    resolutionPreset,
    outputResolutionLabel,
    videoFps,
    commercialLength,
    shotCount,
    noVisibleTalent,
  ])
  const externalLlmPrompt = useMemo(
    () => buildExternalLlmPrompt(currentData, directorScript || generatedScript),
    [currentData, directorScript, generatedScript]
  )

  const applyToDirector = (scriptOverride = directorScript || generatedScript) => {
    const script = scriptOverride || generatedScript
    setYoloAdBrandName(brand)
    setYoloAdProductName(product)
    setYoloAdColorPalette(colors)
    setYoloAdLogoConstraints(promise)
    setYoloAdSpokespersonRole(noVisibleTalent ? 'No visible talent' : talentDirection)
    setYoloAdWardrobeNotes(noVisibleTalent ? '' : talentDirection)
    setYoloAdProductAssetId(productAssetId || null)
    setYoloAdModelAssetId(noVisibleTalent ? null : (talentAssetId || null))
    setYoloAdFormatPreset(format)
    setYoloAdPlatformPreset(platform)
    setYoloAdStoryboardSource('cloud')
    setYoloAdStoryboardTier('quality')
    setYoloAdVideoSource('local')
    setYoloAdVideoTier('quality')
    setYoloAdLocalVideoWorkflowId(videoWorkflowId)
    setYoloTargetDuration(Number(commercialLength) || 30)
    setYoloShotsPerScene(Number(shotCount) || 8)
    setYoloAnglesPerShot(1)
    setYoloTakesPerAngle(1)
    setYoloVideoFps(Number(videoFps) || 24)
    setResolution(outputResolution)
    setImageResolution(outputResolution)
    setYoloStyleNotes([
      selectedFormat.label,
      selectedTone.text,
      colors,
      `Output resolution: ${outputResolutionLabel}`,
      `FPS: ${Number(videoFps) || 24}`,
      productAssetId ? 'Use the product reference as the packaging/product anchor.' : '',
      talentAssetId && !noVisibleTalent ? 'Use the talent reference as the identity/wardrobe anchor.' : '',
    ].filter(Boolean).join('. '))
    setYoloScript(script)
  }

  const goTo = (nextStep) => {
    if (nextStep === 'script') {
      setDirectorScript(generatedScript)
      applyToDirector(generatedScript)
    }
    setStep(nextStep)
  }

  const copyExternalLlmPrompt = async () => {
    setLlmCopyStatus('')
    try {
      await navigator.clipboard.writeText(externalLlmPrompt)
      setLlmCopyStatus('Copied prompt')
    } catch (_) {
      setLlmCopyStatus('Select and copy manually')
    }
  }

  const handleBuildPlan = () => {
    applyToDirector(directorScript)
    const plan = handleBuildActiveYoloPlan()
    if (Array.isArray(plan) && plan.length > 0) {
      setSelectedShotIndex(0)
      setSelectedVideoIndex(0)
      setStep('keyframes')
    }
  }

  const updateLength = (value) => {
    const nextLength = Number(value) || 30
    const nextCount = getSuggestedShotCount(nextLength)
    setCommercialLength(nextLength)
    setShotCount(nextCount)
    const nextScript = buildDirectorScript({ ...currentData, commercialLength: nextLength, shotCount: nextCount })
    setDirectorScript(nextScript)
    applyToDirector(nextScript)
    setYoloTargetDuration(nextLength)
    setYoloShotsPerScene(nextCount)
  }

  const updateShotCount = (value) => {
    const nextCount = Number(value) || 8
    setShotCount(nextCount)
    const nextScript = buildDirectorScript({ ...currentData, shotCount: nextCount })
    setDirectorScript(nextScript)
    applyToDirector(nextScript)
    setYoloShotsPerScene(nextCount)
  }

  const selectedShotRow = planShots[selectedShotIndex] || planShots[0] || null
  const selectedVideoRow = planShots[selectedVideoIndex] || planShots[0] || null

  const getFirstVariantForShot = (sceneId, shotId) => (
    (yoloQueueVariants || []).find((variant) => variant.sceneId === sceneId && variant.shotId === shotId) || null
  )

  const stepIndex = STEPS.findIndex((item) => item.id === step)

  const renderStepNav = () => (
    <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-900/70 p-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-sf-text-muted">Ad Creation Easy Mode</div>
      <div className="mt-3 grid grid-cols-2 gap-1 md:grid-cols-4 xl:grid-cols-8">
        {STEPS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStep(item.id)}
            disabled={(item.id === 'keyframes' || item.id === 'videos') && planShots.length === 0}
            className={`rounded-lg border px-2 py-1.5 text-left text-[10px] transition-colors ${
              item.id === step
                ? 'border-sf-accent bg-sf-accent/15 text-sf-accent'
                : index < stepIndex
                  ? 'border-sf-dark-600 bg-sf-dark-800 text-sf-text-secondary'
                  : 'border-sf-dark-700 bg-sf-dark-950/40 text-sf-text-muted hover:border-sf-dark-500 hover:text-sf-text-secondary'
            }`}
          >
            <div className="text-[9px] uppercase tracking-wider opacity-70">Step {index + 1}</div>
            <div className="font-medium">{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderChoiceButton = (isSelected, label, onClick, helper = '', key = label) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      title={helper}
      className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
        isSelected
          ? 'border-sf-accent bg-sf-accent/15 text-sf-accent'
          : 'border-sf-dark-600 bg-sf-dark-900/70 text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary'
      }`}
    >
      <div className="font-medium">{label}</div>
      {helper ? <div className="mt-1 text-[10px] text-sf-text-muted">{helper}</div> : null}
    </button>
  )

  const renderActions = (back, next, nextLabel) => (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => setStep(back)}
        className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary"
      >
        Back
      </button>
      <button
        type="button"
        onClick={() => goTo(next)}
        className="rounded-lg bg-sf-accent px-3 py-2 text-xs text-white hover:bg-sf-accent-hover"
      >
        {nextLabel}
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      {renderStepNav()}

      {step === 'brief' && (
        <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-900/60 p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-sf-accent">ComfyStudio asks</div>
            <h2 className="mt-1 text-lg font-semibold text-sf-text-primary">Let's start with the product.</h2>
            <p className="mt-1 text-xs text-sf-text-muted">Answer what you know. Blank fields can be filled in later from the editable script.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-xs text-sf-text-secondary">
              <span className="text-[10px] uppercase tracking-wider text-sf-text-muted">Brand name</span>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 w-full rounded-lg border border-sf-dark-600 bg-sf-dark-800 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none" />
            </label>
            <label className="text-xs text-sf-text-secondary">
              <span className="text-[10px] uppercase tracking-wider text-sf-text-muted">Product</span>
              <input value={product} onChange={(e) => setProduct(e.target.value)} className="mt-1 w-full rounded-lg border border-sf-dark-600 bg-sf-dark-800 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none" />
            </label>
            <label className="text-xs text-sf-text-secondary">
              <span className="text-[10px] uppercase tracking-wider text-sf-text-muted">Visual rules</span>
              <input value={colors} onChange={(e) => setColors(e.target.value)} className="mt-1 w-full rounded-lg border border-sf-dark-600 bg-sf-dark-800 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none" />
            </label>
            <label className="text-xs text-sf-text-secondary">
              <span className="text-[10px] uppercase tracking-wider text-sf-text-muted">Audience</span>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1 w-full rounded-lg border border-sf-dark-600 bg-sf-dark-800 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none" />
            </label>
            <label className="text-xs text-sf-text-secondary md:col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-sf-text-muted">What should people remember?</span>
              <textarea value={promise} onChange={(e) => setPromise(e.target.value)} rows={3} className="mt-1 w-full resize-y rounded-lg border border-sf-dark-600 bg-sf-dark-800 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none" />
            </label>
            <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-800/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-sf-text-muted">Aspect ratio</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {OUTPUT_ASPECT_RATIO_OPTIONS.map((option) => renderChoiceButton(
                  platform === option.id,
                  option.label,
                  () => {
                    setPlatform(option.id)
                    const nextResolution = resolveOutputResolution(option.id, resolutionPreset)
                    setResolution(nextResolution)
                    setImageResolution(nextResolution)
                  },
                  option.helper,
                  `aspect-${option.id}`
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-800/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-sf-text-muted">Output resolution</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {RESOLUTION_OPTIONS.map((option) => renderChoiceButton(
                  resolutionPreset === option.id,
                  option.label,
                  () => {
                    setResolutionPreset(option.id)
                    const nextResolution = resolveOutputResolution(platform, option.id)
                    setResolution(nextResolution)
                    setImageResolution(nextResolution)
                  },
                  option.id === '720p' ? 'Faster and lighter.' : 'Sharper output, more work for local video.',
                  `resolution-${option.id}`
                ))}
              </div>
              <div className="mt-2 text-[10px] text-sf-text-muted">
                Current frame size: <span className="text-sf-text-secondary">{outputResolutionLabel}</span>
              </div>
            </div>
            <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-800/40 p-3">
              <div className="text-[10px] uppercase tracking-wider text-sf-text-muted">Frames per second</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {FPS_OPTIONS.map((fpsOption) => renderChoiceButton(
                  videoFps === fpsOption,
                  `${fpsOption} fps`,
                  () => {
                    setVideoFps(fpsOption)
                    setYoloVideoFps(fpsOption)
                  },
                  fpsOption === 24 ? 'Cinematic default.' : fpsOption === 25 ? 'PAL-friendly delivery.' : 'Smoother motion.',
                  `fps-${fpsOption}`
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => goTo('direction')} className="rounded-lg bg-sf-accent px-3 py-2 text-xs text-white hover:bg-sf-accent-hover">Next: Creative Direction</button>
          </div>
        </div>
      )}

      {step === 'direction' && (
        <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-900/60 p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-sf-accent">ComfyStudio asks</div>
            <h2 className="mt-1 text-lg font-semibold text-sf-text-primary">What kind of ad should this become?</h2>
            <p className="mt-1 text-xs text-sf-text-muted">These choices become structured Director settings, not a freeform chatbot prompt.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-sf-text-muted">Format</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {FORMAT_OPTIONS.map((option) => renderChoiceButton(format === option.id, option.label, () => setFormat(option.id)))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-sf-text-muted">Platform</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {PLATFORM_OPTIONS.map((option) => renderChoiceButton(platform === option.id, option.label, () => {
                  setPlatform(option.id)
                  const nextResolution = resolveOutputResolution(option.id, resolutionPreset)
                  setResolution(nextResolution)
                  setImageResolution(nextResolution)
                }))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-sf-text-muted">Tone</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TONE_OPTIONS.map((option) => renderChoiceButton(tone === option.id, option.label, () => setTone(option.id)))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-sf-text-muted">Video model</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {VIDEO_MODEL_OPTIONS.map((option) => renderChoiceButton(videoWorkflowId === option.id, option.label, () => setVideoWorkflowId(option.id), option.helper))}
              </div>
            </div>
            <label className="text-xs text-sf-text-secondary md:col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-sf-text-muted">Optional talent or voice direction</span>
              <textarea value={talentDirection} onChange={(e) => setTalentDirection(e.target.value)} rows={3} placeholder="Example: friendly skincare expert, calm female voiceover, no visible spokesperson" className="mt-1 w-full resize-y rounded-lg border border-sf-dark-600 bg-sf-dark-800 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none" />
            </label>
          </div>
          {renderActions('brief', 'references', 'Next: References')}
        </div>
      )}

      {step === 'references' && (
        <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-900/60 p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-sf-accent">ComfyStudio asks</div>
            <h2 className="mt-1 text-lg font-semibold text-sf-text-primary">Do you have product or talent references?</h2>
            <p className="mt-1 text-xs text-sf-text-muted">Optional, but best results come from product sheets and character sheets with multiple angles.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-800/40 p-3">
              <div className="text-sm font-semibold text-sf-text-primary">Product reference</div>
              <p className="mt-1 text-[11px] text-sf-text-muted">Recommended: product sheet with front, side, label, packaging, and in-hand/use context.</p>
              <select value={productAssetId} onChange={(e) => setProductAssetId(e.target.value)} className="mt-3 w-full rounded-lg border border-sf-dark-600 bg-sf-dark-900 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none">
                <option value="">No product asset selected</option>
                {imageAssets.map((asset) => <option key={`easy-product-${asset.id}`} value={asset.id}>{asset.name}</option>)}
              </select>
            </div>
            <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-800/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-sf-text-primary">Talent reference</div>
                <label className="flex items-center gap-1.5 text-[10px] text-sf-text-muted">
                  <input type="checkbox" checked={noVisibleTalent} onChange={(e) => setNoVisibleTalent(e.target.checked)} />
                  No visible talent
                </label>
              </div>
              <p className="mt-1 text-[11px] text-sf-text-muted">Recommended: character sheet with front, side, 3/4 view, expressions, and wardrobe.</p>
              <select disabled={noVisibleTalent} value={talentAssetId} onChange={(e) => setTalentAssetId(e.target.value)} className="mt-3 w-full rounded-lg border border-sf-dark-600 bg-sf-dark-900 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none disabled:opacity-50">
                <option value="">No talent asset selected</option>
                {imageAssets.map((asset) => <option key={`easy-talent-${asset.id}`} value={asset.id}>{asset.name}</option>)}
              </select>
            </div>
          </div>
          {renderActions('direction', 'review', 'Review My Brief')}
        </div>
      )}

      {step === 'review' && (
        <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-900/60 p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-sf-accent">Review checkpoint</div>
            <h2 className="mt-1 text-lg font-semibold text-sf-text-primary">Here is the ad brief I heard.</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              ['Brand', brand || 'Auto'],
              ['Product', product || 'Auto'],
              ['Audience', audience || 'Auto'],
              ['Length', `${commercialLength}s`],
              ['Shots', String(shotCount)],
              ['Aspect', platform === 'landscape_16x9' ? '16:9' : platform === 'square_1x1' ? '1:1' : '9:16'],
              ['Resolution', `${resolutionPreset} (${outputResolutionLabel})`],
              ['FPS', `${videoFps} fps`],
              ['Video', selectedVideoWorkflow.label],
              ['Keyframes', 'Nano Banana 2'],
              ['Product reference', productAssetId ? 'Selected' : 'Optional'],
              ['Talent reference', noVisibleTalent ? 'No visible talent' : (talentAssetId ? 'Selected' : 'Optional')],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-sf-dark-700 bg-sf-dark-800/40 px-3 py-2">
                <div className="text-[10px] uppercase tracking-wider text-sf-text-muted">{label}</div>
                <div className="mt-1 text-xs font-medium text-sf-text-primary">{value}</div>
              </div>
            ))}
          </div>
          {renderActions('references', 'script', 'Build Script Plan')}
        </div>
      )}

      {step === 'script' && (
        <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-900/60 p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-sf-accent">Review checkpoint</div>
            <h2 className="mt-1 text-lg font-semibold text-sf-text-primary">Proposed script and storyboard plan.</h2>
            <p className="mt-1 text-xs text-sf-text-muted">This script is structured Director text. You can edit it manually before building the plan.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="text-xs text-sf-text-secondary">
              <span className="text-[10px] uppercase tracking-wider text-sf-text-muted">Commercial length</span>
              <select value={commercialLength} onChange={(e) => updateLength(e.target.value)} className="mt-1 w-full rounded-lg border border-sf-dark-600 bg-sf-dark-800 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none">
                {COMMERCIAL_LENGTH_OPTIONS.map((seconds) => <option key={seconds} value={seconds}>{seconds} seconds</option>)}
              </select>
            </label>
            <label className="text-xs text-sf-text-secondary">
              <span className="text-[10px] uppercase tracking-wider text-sf-text-muted">How many shots?</span>
              <select value={shotCount} onChange={(e) => updateShotCount(e.target.value)} className="mt-1 w-full rounded-lg border border-sf-dark-600 bg-sf-dark-800 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none">
                {SHOT_COUNT_OPTIONS.map((count) => <option key={count} value={count}>{count} shots</option>)}
              </select>
              <span className="mt-1 block text-[10px] text-sf-text-muted">{getShotHint(commercialLength)}</span>
            </label>
            <div className="rounded-lg border border-sf-dark-700 bg-sf-dark-800/40 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-sf-text-muted">Model route</div>
              <div className="mt-1 text-xs text-sf-text-primary">Nano Banana 2 keyframes + {selectedVideoWorkflow.label} video</div>
            </div>
          </div>
          <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-800/40 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-sf-accent">Optional: use your own LLM</div>
                <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-sf-text-muted">
                  No ComfyStudio API key or setup required. Copy this prompt into ChatGPT, Claude, Gemini, or another LLM, then paste the result back into the editable Director Script below.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {llmCopyStatus && <span className="text-[10px] text-sf-text-muted">{llmCopyStatus}</span>}
                <button
                  type="button"
                  onClick={copyExternalLlmPrompt}
                  className="rounded-lg border border-sf-accent/50 bg-sf-accent/10 px-3 py-2 text-xs text-sf-accent transition-colors hover:bg-sf-accent/20"
                >
                  Copy LLM Prompt
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={externalLlmPrompt}
              rows={7}
              spellCheck={false}
              onFocus={(event) => event.target.select()}
              onClick={(event) => event.target.select()}
              className="mt-3 w-full resize-y rounded-lg border border-sf-dark-700 bg-sf-dark-950/70 px-3 py-2 font-mono text-[10px] leading-5 text-sf-text-secondary focus:border-sf-accent focus:outline-none"
            />
          </div>
          <textarea
            value={directorScript || generatedScript}
            onChange={(e) => {
              setDirectorScript(e.target.value)
              setYoloScript(e.target.value)
            }}
            rows={18}
            spellCheck={false}
            className="w-full resize-y rounded-lg border border-sf-dark-600 bg-sf-dark-800 px-3 py-2 font-mono text-[11px] leading-5 text-sf-text-primary focus:border-sf-accent focus:outline-none"
          />
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11px] leading-relaxed text-amber-100/90">
            Double-check the Director Script before continuing. The next step uses this script to create keyframe jobs, so make sure the shot order, prompts, timing, and references look right.
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={() => setStep('review')} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary">Back</button>
            <div className="flex gap-2">
              <button type="button" onClick={() => { const next = generatedScript; setDirectorScript(next); applyToDirector(next) }} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary">Regenerate script from brief</button>
              <button type="button" onClick={handleBuildPlan} className="rounded-lg bg-sf-accent px-3 py-2 text-xs text-white hover:bg-sf-accent-hover">Looks Good - Create Keyframes</button>
            </div>
          </div>
        </div>
      )}

      {step === 'keyframes' && (
        <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-900/60 p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-sf-accent">Storyboard review</div>
            <h2 className="mt-1 text-lg font-semibold text-sf-text-primary">Your keyframes are ready to review.</h2>
            <p className="mt-1 text-xs text-sf-text-muted">Select a shot, edit only its keyframe prompt if needed, then regenerate just that shot.</p>
          </div>
          {planShots.length === 0 ? (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">Build the script plan first.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                {planShots.map(({ scene, shot }, index) => {
                  const variant = getFirstVariantForShot(scene.id, shot.id)
                  const asset = variant ? yoloStoryboardAssetMap?.get(variant.key) : null
                  const url = getAssetUrl(asset)
                  return (
                    <button
                      key={`easy-keyframe-${scene.id}-${shot.id}`}
                      type="button"
                      onClick={() => setSelectedShotIndex(index)}
                      className={`overflow-hidden rounded-xl border text-left transition-colors ${
                        selectedShotIndex === index ? 'border-sf-accent bg-sf-accent/10' : 'border-sf-dark-700 bg-sf-dark-900/70 hover:border-sf-dark-500'
                      }`}
                    >
                      <div className="flex h-28 items-center justify-center bg-sf-dark-800">
                        {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span className="text-[10px] text-sf-text-muted">Keyframe pending</span>}
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-semibold text-sf-text-primary">Shot {index + 1}: {shot.id}</div>
                        <div className="mt-1 line-clamp-2 text-[10px] text-sf-text-muted">{shot.imageBeat || shot.beat}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
              {selectedShotRow && (
                <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-800/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-sf-text-primary">Shot {selectedShotIndex + 1}: {selectedShotRow.shot.id}</div>
                      <div className="text-[10px] text-sf-text-muted">{selectedShotRow.scene.id}</div>
                    </div>
                    <span className="rounded-full border border-sf-dark-600 px-2 py-1 text-[10px] text-sf-text-muted">Nano Banana 2 keyframe</span>
                  </div>
                  <label className="mt-3 block text-xs text-sf-text-secondary">
                    <span className="text-[10px] uppercase tracking-wider text-sf-text-muted">Edit shot keyframe prompt</span>
                    <textarea
                      value={selectedShotRow.shot.imageBeat || selectedShotRow.shot.beat || ''}
                      onChange={(e) => handleYoloShotImageBeatChange(selectedShotRow.scene.id, selectedShotRow.shot.id, e.target.value)}
                      rows={4}
                      className="mt-1 w-full resize-y rounded-lg border border-sf-dark-600 bg-sf-dark-900 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none"
                    />
                  </label>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button type="button" disabled={yoloDependencyCheckInProgress} onClick={() => { setKeyframeStatus(`Queued keyframe regeneration for Shot ${selectedShotIndex + 1}.`); void handleQueueYoloShotStoryboard(selectedShotRow.scene.id, selectedShotRow.shot.id) }} className="rounded-lg bg-sf-accent px-3 py-2 text-xs text-white hover:bg-sf-accent-hover disabled:cursor-not-allowed disabled:opacity-50">Regenerate Selected Shot</button>
                    <button type="button" onClick={() => { setYoloTakesPerAngle(3); handleYoloShotTakesChange(selectedShotRow.scene.id, selectedShotRow.shot.id, 3); setKeyframeStatus('Variation mode set to 3 takes. Click regenerate to queue three seed variations for the selected shot.') }} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary">Make 3 Variations</button>
                    <span className="text-[10px] text-sf-text-muted">{keyframeStatus}</span>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button type="button" onClick={() => setStep('script')} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary">Back</button>
                <div className="flex gap-2">
                  <button type="button" disabled={yoloDependencyCheckInProgress} onClick={() => { setKeyframeStatus('Queued keyframes for all planned shots.'); void handleQueueYoloStoryboards() }} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary disabled:opacity-50">Queue All Keyframes</button>
                  <button type="button" disabled={yoloStoryboardReadyCount === 0} onClick={() => setStep('videos')} className="rounded-lg bg-sf-accent px-3 py-2 text-xs text-white hover:bg-sf-accent-hover disabled:cursor-not-allowed disabled:opacity-50">Everything Looks Good - Create Videos</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {step === 'videos' && (
        <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-900/60 p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-sf-accent">Video review</div>
            <h2 className="mt-1 text-lg font-semibold text-sf-text-primary">Review the shot videos.</h2>
            <p className="mt-1 text-xs text-sf-text-muted">Select a shot video, edit only its motion prompt if needed, then regenerate just that clip.</p>
          </div>
          <div className="rounded-lg border border-sf-dark-700 bg-sf-dark-800/40 px-3 py-2 text-xs text-sf-text-secondary">
            {planShots.length} shots / {commercialLength}s / Nano Banana 2 keyframes / {selectedVideoWorkflow.label} video
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            {planShots.map(({ scene, shot }, index) => {
              const variant = getFirstVariantForShot(scene.id, shot.id)
              const asset = variant ? (videoAssetMap.get(variant.key) || videoAssetMap.get(`${variant.key}::${yoloDefaultVideoWorkflowId}`)) : null
              const url = getAssetUrl(asset)
              const hasKeyframe = variant ? yoloStoryboardAssetMap?.has(variant.key) : false
              return (
                <button
                  key={`easy-video-${scene.id}-${shot.id}`}
                  type="button"
                  onClick={() => setSelectedVideoIndex(index)}
                  className={`overflow-hidden rounded-xl border text-left transition-colors ${
                    selectedVideoIndex === index ? 'border-sf-accent bg-sf-accent/10' : 'border-sf-dark-700 bg-sf-dark-900/70 hover:border-sf-dark-500'
                  }`}
                >
                  <div className="flex h-28 items-center justify-center bg-sf-dark-800">
                    {url ? <video src={url} className="h-full w-full object-cover" muted /> : <span className="text-[10px] text-sf-text-muted">{hasKeyframe ? 'Video pending' : 'Needs keyframe'}</span>}
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-semibold text-sf-text-primary">Shot {index + 1}: {shot.id}</div>
                    <div className="mt-1 text-[10px] text-sf-text-muted">{asset ? 'Video ready' : hasKeyframe ? 'Ready to queue' : 'Create keyframe first'}</div>
                  </div>
                </button>
              )
            })}
          </div>
          {selectedVideoRow && (
            <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-800/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-sf-text-primary">Shot {selectedVideoIndex + 1} Video: {selectedVideoRow.shot.id}</div>
                  <div className="text-[10px] text-sf-text-muted">{selectedVideoRow.scene.id}</div>
                </div>
                <span className="rounded-full border border-sf-dark-600 px-2 py-1 text-[10px] text-sf-text-muted">{selectedVideoWorkflow.label}</span>
              </div>
              <label className="mt-3 block text-xs text-sf-text-secondary">
                <span className="text-[10px] uppercase tracking-wider text-sf-text-muted">Edit shot motion prompt</span>
                <textarea
                  value={selectedVideoRow.shot.videoBeat || selectedVideoRow.shot.beat || ''}
                  onChange={(e) => handleYoloShotVideoBeatChange(selectedVideoRow.scene.id, selectedVideoRow.shot.id, e.target.value)}
                  rows={4}
                  className="mt-1 w-full resize-y rounded-lg border border-sf-dark-600 bg-sf-dark-900 px-3 py-2 text-xs text-sf-text-primary focus:border-sf-accent focus:outline-none"
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" disabled={yoloDependencyCheckInProgress} onClick={() => { setVideoStatus(`Queued video regeneration for Shot ${selectedVideoIndex + 1}.`); void handleQueueYoloShotVideo(selectedVideoRow.scene.id, selectedVideoRow.shot.id) }} className="rounded-lg bg-sf-accent px-3 py-2 text-xs text-white hover:bg-sf-accent-hover disabled:cursor-not-allowed disabled:opacity-50">Regenerate Shot Video</button>
                <button type="button" onClick={() => { setYoloTakesPerAngle(3); handleYoloShotTakesChange(selectedVideoRow.scene.id, selectedVideoRow.shot.id, 3); setVideoStatus('Variation mode set to 3 takes. Click regenerate to queue three video seed variations after keyframes exist.') }} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary">Make 3 Variations</button>
                <span className="text-[10px] text-sf-text-muted">{videoStatus}</span>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={() => setStep('keyframes')} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary">Back</button>
            <div className="flex gap-2">
              <button type="button" disabled={yoloDependencyCheckInProgress || yoloStoryboardReadyCount === 0} onClick={() => { setVideoStatus('Queued one selected shot video test.'); if (selectedVideoRow) void handleQueueYoloShotVideo(selectedVideoRow.scene.id, selectedVideoRow.shot.id) }} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary disabled:opacity-50">Create One Test Video First</button>
              <button type="button" disabled={yoloDependencyCheckInProgress || yoloStoryboardReadyCount === 0} onClick={() => { setVideoStatus('Queued videos for all keyframed shots.'); void handleQueueYoloVideos() }} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary disabled:opacity-50">Queue All Shot Videos</button>
              <button type="button" onClick={() => setStep('done')} className="rounded-lg bg-sf-accent px-3 py-2 text-xs text-white hover:bg-sf-accent-hover">Approve Videos and Finish</button>
            </div>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="rounded-xl border border-sf-dark-700 bg-sf-dark-900/60 p-4 space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-sf-accent">Queued</div>
            <h2 className="mt-1 text-lg font-semibold text-sf-text-primary">Your ad is generating.</h2>
            <p className="mt-1 text-xs text-sf-text-muted">Watch progress in the queue. You can still return to Keyframes or Videos to regenerate individual shots.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setStep('keyframes')} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary">Open Keyframes</button>
            <button type="button" onClick={() => setStep('videos')} className="rounded-lg border border-sf-dark-600 px-3 py-2 text-xs text-sf-text-secondary hover:border-sf-dark-500 hover:text-sf-text-primary">Open Videos</button>
            <button type="button" onClick={() => setStep('brief')} className="rounded-lg bg-sf-accent px-3 py-2 text-xs text-white hover:bg-sf-accent-hover">Start Another Easy Ad</button>
          </div>
        </div>
      )}
    </div>
  )
}
