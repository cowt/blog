import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageUpload: {
      /**
       * Open file picker to upload an image
       */
      openImageUpload: () => ReturnType
      /**
       * Insert an image with upload handling
       */
      insertImageWithUpload: (file: File) => ReturnType
    }
  }
}

export interface ImageUploadOptions {
  /**
   * Function to handle image upload
   */
  onImageUpload: ((file: File) => Promise<string | null>) | null
  /**
   * Accepted file types
   */
  accept: string
  /**
   * Maximum file size in bytes
   */
  maxSize: number
  /**
   * Whether to allow multiple file selection
   */
  multiple: boolean
}

/**
 * Image Upload extension following Tiptap official patterns
 * Handles image upload with file picker and drag-and-drop support
 */
export const ImageUpload = Extension.create<ImageUploadOptions>({
  name: "imageUpload",

  addOptions() {
    return {
      onImageUpload: null,
      accept: "image/*",
      maxSize: 5 * 1024 * 1024, // 5MB
      multiple: false,
    }
  },

  addCommands() {
    return {
      openImageUpload:
        () =>
        ({ editor }) => {
          const input = document.createElement("input")
          input.type = "file"
          input.accept = this.options.accept
          input.multiple = this.options.multiple
          
          input.onchange = async (event) => {
            const files = (event.target as HTMLInputElement).files
            if (!files || files.length === 0) return

            for (const file of Array.from(files)) {
              if (file.size > this.options.maxSize) {
                console.error(`File ${file.name} is too large. Maximum size is ${this.options.maxSize} bytes.`)
                continue
              }

              if (this.options.onImageUpload) {
                try {
                  const url = await this.options.onImageUpload(file)
                  if (url) {
                    editor.commands.setImage({ 
                      src: url,
                      alt: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for alt text
                    })
                  }
                } catch (error) {
                  console.error("Image upload failed:", error)
                }
              }
            }
          }
          
          input.click()
          return true
        },

      insertImageWithUpload:
        (file: File) =>
        async ({ editor }) => {
          if (!this.options.onImageUpload) {
            console.error("No upload handler provided")
            return false
          }

          if (file.size > this.options.maxSize) {
            console.error(`File ${file.name} is too large. Maximum size is ${this.options.maxSize} bytes.`)
            return false
          }

          try {
            const url = await this.options.onImageUpload(file)
            if (url) {
              return editor.commands.setImage({ 
                src: url,
                alt: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for alt text
              })
            }
          } catch (error) {
            console.error("Image upload failed:", error)
          }

          return false
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-i": () => this.editor.commands.openImageUpload(),
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("imageUploadDragDrop"),
        props: {
          handleDOMEvents: {
            drop: (view, event) => {
              const hasFiles = event.dataTransfer?.files && event.dataTransfer.files.length > 0
              if (!hasFiles) return false

              const images = Array.from(event.dataTransfer.files).filter((file) =>
                file.type.startsWith("image/")
              )

              if (images.length === 0) return false

              event.preventDefault()

              const { schema } = view.state
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              })

              if (!coordinates) return true

              images.forEach(async (file) => {
                if (file.size > this.options.maxSize) {
                  console.error(`File ${file.name} is too large. Maximum size is ${this.options.maxSize} bytes.`)
                  return
                }

                if (this.options.onImageUpload) {
                  try {
                    const url = await this.options.onImageUpload(file)
                    if (url) {
                      const node = schema.nodes.image.create({
                        src: url,
                        alt: file.name.replace(/\.[^/.]+$/, ""),
                      })

                      const transaction = view.state.tr.insert(coordinates.pos, node)
                      view.dispatch(transaction)
                    }
                  } catch (error) {
                    console.error("Image upload failed:", error)
                  }
                }
              })

              return true
            },
            paste: (view, event) => {
              const hasFiles = event.clipboardData?.files && event.clipboardData.files.length > 0
              if (!hasFiles) return false

              const images = Array.from(event.clipboardData.files).filter((file) =>
                file.type.startsWith("image/")
              )

              if (images.length === 0) return false

              event.preventDefault()

              images.forEach(async (file) => {
                if (file.size > this.options.maxSize) {
                  console.error(`File ${file.name} is too large. Maximum size is ${this.options.maxSize} bytes.`)
                  return
                }

                if (this.options.onImageUpload) {
                  try {
                    const url = await this.options.onImageUpload(file)
                    if (url) {
                      this.editor.commands.setImage({ 
                        src: url,
                        alt: file.name.replace(/\.[^/.]+$/, ""),
                      })
                    }
                  } catch (error) {
                    console.error("Image upload failed:", error)
                  }
                }
              })

              return true
            },
          },
        },
      }),
    ]
  },
})