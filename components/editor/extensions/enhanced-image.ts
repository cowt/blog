import Image from "@tiptap/extension-image"

/**
 * Enhanced Image extension following Tiptap official patterns
 * Extends the base Image extension with additional attributes for styling and layout
 */
export const EnhancedImage = Image.extend({
  name: "image",

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: "block mx-auto rounded-lg border border-border max-w-full h-auto my-4",
      },
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {}
          }
          return { src: attributes.src }
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          if (!attributes.alt) {
            return {}
          }
          return { alt: attributes.alt }
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("title"),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {}
          }
          return { title: attributes.title }
        },
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("width")
          return width ? parseInt(width, 10) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return { width: attributes.width.toString() }
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute("height")
          return height ? parseInt(height, 10) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {}
          }
          return { height: attributes.height.toString() }
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {}
          }
          return { style: attributes.style }
        },
      },
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          const defaultClass = this.options.HTMLAttributes?.class || ""
          const customClass = attributes.class || ""
          const finalClass = [defaultClass, customClass].filter(Boolean).join(" ")
          return finalClass ? { class: finalClass } : {}
        },
      },
      "data-align": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-align"),
        renderHTML: (attributes) => {
          if (!attributes["data-align"]) {
            return {}
          }
          return { "data-align": attributes["data-align"] }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element) => {
          const img = element as HTMLImageElement
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            width: img.getAttribute("width"),
            height: img.getAttribute("height"),
            style: img.getAttribute("style"),
            class: img.getAttribute("class"),
            "data-align": img.getAttribute("data-align"),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", HTMLAttributes]
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
      updateImage:
        (options) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, options)
        },
    }
  },
})