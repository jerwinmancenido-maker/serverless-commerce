import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import {
  ArrowUturnLeft,
  Link as LinkIcon,
  ListBullet,
  Palette,
  Photo,
  QueueList,
  TextHighlight,
} from "@medusajs/icons";
import {
  IconButton,
  Select,
  Text,
  Tooltip,
  TooltipProvider,
  toast,
} from "@medusajs/ui";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import { sdk } from "../../lib/sdk";

type ProductDescriptionEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 20_000;
const DEFAULT_TEXT_COLOR = "#111827";
const DEFAULT_HIGHLIGHT_COLOR = "#fef08a";

const ProductDescriptionEditor = ({
  value,
  onChange,
}: ProductDescriptionEditorProps) => {
  const imageInputId = useId();
  const onChangeRef = useRef(onChange);
  const editorElementRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [, setEditorRevision] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [descriptionLength, setDescriptionLength] = useState(value.length);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorElementRef.current) return;

    const nextEditor = new Editor({
      element: editorElementRef.current,
      extensions: [
        StarterKit.configure({
          code: false,
          codeBlock: false,
          heading: { levels: [2, 3] },
          horizontalRule: false,
          link: false,
        }),
        TextStyle,
        Color,
        Underline,
        Highlight.configure({ multicolor: true }),
        Placeholder.configure({
          placeholder:
            "Describe the product, its research applications, peptide sequence, etc.",
        }),
        Link.configure({
          autolink: true,
          defaultProtocol: "https",
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        }),
        Image.configure({
          allowBase64: false,
          HTMLAttributes: {
            loading: "lazy",
          },
        }),
      ],
      content: value || "<p></p>",
      editorProps: {
        attributes: {
          class:
            "min-h-44 px-4 py-3 outline-none text-ui-fg-base text-small [&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-ui-fg-muted [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-ui-border-strong [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:text-large [&_h2]:font-semibold [&_h3]:font-semibold [&_img]:my-3 [&_img]:max-h-80 [&_img]:max-w-full [&_img]:rounded-md [&_img]:object-contain [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:list-disc",
          "aria-label": "Product description",
        },
      },
      onSelectionUpdate: () => setEditorRevision((current) => current + 1),
      onUpdate: ({ editor: currentEditor }) => {
        const html = currentEditor.isEmpty ? "" : currentEditor.getHTML();
        setDescriptionLength(html.length);
        setEditorRevision((current) => current + 1);
        onChangeRef.current(html);
      },
    });

    setEditor(nextEditor);

    return () => {
      nextEditor.destroy();
      setEditor(null);
    };
  }, []);

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.isEmpty ? "" : editor.getHTML();

    if (value !== currentHtml) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
      setDescriptionLength(value.length);
    }
  }, [editor, value]);

  const updateLink = () => {
    if (!editor) return;

    const currentHref = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt(
      "Enter a secure link (https://), email link (mailto:), phone link (tel:), or site path (/products/...)",
      currentHref || "https://",
    );

    if (href === null) return;

    const normalizedHref = href.trim();

    if (!normalizedHref) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    if (!/^(https?:\/\/|mailto:|tel:|\/)/i.test(normalizedHref)) {
      toast.error("Use an https://, mailto:, tel:, or site-relative link");
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalizedHref })
      .run();
  };

  const uploadInlineImage = async (file: File) => {
    if (!editor) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error(`${file.name} exceeds the 10 MB upload limit`);
      return;
    }

    setIsUploading(true);

    try {
      const response = await sdk.admin.upload.create({ files: [file] });
      const uploaded = response.files[0];

      if (!uploaded?.url) {
        throw new Error("The uploaded image did not return a usable URL");
      }

      editor
        .chain()
        .focus()
        .setImage({ src: uploaded.url, alt: file.name })
        .run();
      toast.success("Image added to description");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Description image could not be uploaded",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const toolbarButton = (
    label: string,
    icon: ReactNode,
    isActive: boolean,
    onClick: () => void,
    disabled = false,
  ) => (
    <Tooltip content={label}>
      <IconButton
        type="button"
        size="small"
        variant="transparent"
        aria-label={label}
        aria-pressed={isActive}
        disabled={!editor || disabled}
        className={isActive ? "bg-ui-bg-base-pressed" : undefined}
        onClick={onClick}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  const blockFormat = editor?.isActive("heading", { level: 2 })
    ? "heading-2"
    : editor?.isActive("heading", { level: 3 })
      ? "heading-3"
      : "paragraph";

  return (
    <div className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-borders-base">
      <TooltipProvider>
        <div className="flex min-h-12 flex-wrap items-center gap-0.5 border-b border-ui-border-base bg-ui-bg-subtle px-2 py-1.5">
          <Select
            size="small"
            value={blockFormat}
            onValueChange={(nextFormat) => {
              if (nextFormat === "heading-2") {
                editor?.chain().focus().setHeading({ level: 2 }).run();
              } else if (nextFormat === "heading-3") {
                editor?.chain().focus().setHeading({ level: 3 }).run();
              } else {
                editor?.chain().focus().setParagraph().run();
              }
            }}
          >
            <Select.Trigger
              aria-label="Text style"
              className="mr-1 w-32 border-0 bg-transparent shadow-none"
            >
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="paragraph">Normal</Select.Item>
              <Select.Item value="heading-2">Heading</Select.Item>
              <Select.Item value="heading-3">Subheading</Select.Item>
            </Select.Content>
          </Select>

          <div className="mx-1 h-6 w-px bg-ui-border-base" />

          {toolbarButton(
            "Bold",
            <span className="font-bold">B</span>,
            editor?.isActive("bold") || false,
            () => editor?.chain().focus().toggleBold().run(),
          )}
          {toolbarButton(
            "Italic",
            <span className="font-serif text-base italic">I</span>,
            editor?.isActive("italic") || false,
            () => editor?.chain().focus().toggleItalic().run(),
          )}
          {toolbarButton(
            "Underline",
            <span className="underline">U</span>,
            editor?.isActive("underline") || false,
            () => editor?.chain().focus().toggleUnderline().run(),
          )}
          {toolbarButton(
            "Strikethrough",
            <span className="line-through">S</span>,
            editor?.isActive("strike") || false,
            () => editor?.chain().focus().toggleStrike().run(),
          )}

          <Tooltip content="Text color">
            <label className="relative inline-flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-ui-bg-base-hover">
              <Palette />
              <span
                className="absolute bottom-1 h-0.5 w-4 rounded-full"
                style={{
                  backgroundColor:
                    editor?.getAttributes("textStyle").color ||
                    DEFAULT_TEXT_COLOR,
                }}
              />
              <input
                aria-label="Text color"
                className="absolute inset-0 cursor-pointer opacity-0"
                type="color"
                value={
                  editor?.getAttributes("textStyle").color || DEFAULT_TEXT_COLOR
                }
                disabled={!editor}
                onChange={(event) =>
                  editor?.chain().focus().setColor(event.target.value).run()
                }
              />
            </label>
          </Tooltip>

          <Tooltip content="Highlight color">
            <label className="relative inline-flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-ui-bg-base-hover">
              <TextHighlight />
              <span
                className="absolute bottom-1 h-0.5 w-4 rounded-full"
                style={{
                  backgroundColor:
                    editor?.getAttributes("highlight").color ||
                    DEFAULT_HIGHLIGHT_COLOR,
                }}
              />
              <input
                aria-label="Highlight color"
                className="absolute inset-0 cursor-pointer opacity-0"
                type="color"
                value={
                  editor?.getAttributes("highlight").color ||
                  DEFAULT_HIGHLIGHT_COLOR
                }
                disabled={!editor}
                onChange={(event) =>
                  editor
                    ?.chain()
                    .focus()
                    .setHighlight({ color: event.target.value })
                    .run()
                }
              />
            </label>
          </Tooltip>

          <div className="mx-1 h-6 w-px bg-ui-border-base" />

          {toolbarButton(
            "Numbered list",
            <QueueList />,
            editor?.isActive("orderedList") || false,
            () => editor?.chain().focus().toggleOrderedList().run(),
          )}
          {toolbarButton(
            "Bulleted list",
            <ListBullet />,
            editor?.isActive("bulletList") || false,
            () => editor?.chain().focus().toggleBulletList().run(),
          )}
          {toolbarButton(
            "Quote",
            <span className="font-serif text-lg leading-none">”</span>,
            editor?.isActive("blockquote") || false,
            () => editor?.chain().focus().toggleBlockquote().run(),
          )}
          {toolbarButton(
            "Link",
            <LinkIcon />,
            editor?.isActive("link") || false,
            updateLink,
          )}

          <Tooltip content={isUploading ? "Uploading photo" : "Add photo"}>
            <IconButton
              asChild
              type="button"
              size="small"
              variant="transparent"
              isLoading={isUploading}
              disabled={!editor || isUploading}
            >
              <label htmlFor={imageInputId} aria-label="Add photo">
                <Photo />
              </label>
            </IconButton>
          </Tooltip>
          <input
            id={imageInputId}
            className="hidden"
            type="file"
            accept="image/*"
            disabled={!editor || isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadInlineImage(file);
              event.target.value = "";
            }}
          />

          {toolbarButton(
            "Clear formatting",
            <span className="font-medium">Tₓ</span>,
            false,
            () => editor?.chain().focus().unsetAllMarks().clearNodes().run(),
          )}
          {toolbarButton(
            "Undo",
            <ArrowUturnLeft />,
            false,
            () => editor?.chain().focus().undo().run(),
            !editor?.can().undo(),
          )}
        </div>
      </TooltipProvider>

      <div ref={editorElementRef} />

      <div className="flex items-center justify-between border-t border-ui-border-base px-3 py-2">
        <Text size="xsmall" className="text-ui-fg-subtle">
          Format text or add photos inside the description.
        </Text>
        <Text
          size="xsmall"
          className={
            descriptionLength > MAX_DESCRIPTION_LENGTH
              ? "text-ui-fg-error"
              : "text-ui-fg-subtle"
          }
        >
          {descriptionLength.toLocaleString()} /{" "}
          {MAX_DESCRIPTION_LENGTH.toLocaleString()}
        </Text>
      </div>
    </div>
  );
};

export { ProductDescriptionEditor };
