import React, {
  type ReactElement,
  type ElementType,
  type ComponentPropsWithoutRef,
} from "react"
import type { PolymorphicComponentProps, SanityImageProps } from "./types"
import { buildSrc, buildSrcSet, buildSvgAttributes } from "./urlBuilder"
import { ImageWithPreview } from "./ImageWithPreview"

export const SanityImage = <C extends ElementType = "img">({
  as: component,

  // Sanity url
  baseUrl,
  projectId,
  dataset,

  // Image definition data
  id,
  hotspot,
  crop,
  width,
  height,
  mode = "contain",
  vanityName,

  // Data for LQIP (preview image)
  preview,

  // Native-behavior overrides
  htmlWidth,
  htmlHeight,
  htmlId,

  // Image query string params
  queryParams,

  // Any remaining props are passed through to the rendered component
  ...rest
}: PolymorphicComponentProps<C, SanityImageProps>): ReactElement => {
  if (!id) throw new Error("Missing required `id` prop for <SanityImage>.")
  if (!baseUrl && (!projectId || !dataset))
    throw new Error(
      "Missing required `baseUrl` or `projectId` and `dataset` props for <SanityImage>."
    )

  baseUrl = baseUrl ?? `https://cdn.sanity.io/images/${projectId}/${dataset}/`

  const isSvg = id.endsWith("-svg")

  const ImageComponent =
    preview && !isSvg ? ImageWithPreview : component ?? "img"

  const componentProps: ComponentPropsWithoutRef<typeof ImageComponent> = {
    alt: rest.alt ?? "",
    loading: rest.loading ?? "lazy",
    id: htmlId,
    ...rest,
  }

  if (isSvg) {
    // Sanity ignores all transformations for SVGs, so we can just render the
    // component without passing a query string and without doing anything for
    // the preview.
    return (
      <ImageComponent
        {...buildSvgAttributes({ id, baseUrl })}
        {...componentProps}
      />
    )
  }

  // Create default src and build srcSet
  const srcParams = {
    baseUrl,
    id,
    crop,
    hotspot,
    width,
    height,
    mode,
    queryParams,
    vanityName,
  }

  const { src, ...outputDimensions } = buildSrc(srcParams)
  componentProps.srcSet = buildSrcSet(srcParams).join(", ")
  componentProps.src = src
  componentProps.width = htmlWidth ?? outputDimensions.width
  componentProps.height = htmlHeight ?? outputDimensions.height

  if (preview) {
    componentProps.as = component ?? "img"
    componentProps.preview = preview
  }

  return <ImageComponent {...componentProps} />
}
