import React, {Component} from "react";
import {Quill} from "react-quill";
import MagicUrl from "quill-magic-url";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import('react-quill'), {ssr: false});


// import ImageUploader from "quill-image-uploader";

Quill.register("modules/magicUrl", MagicUrl);
// Quill.register("modules/imageUploader", ImageUploader);

// --- link stuff begin ---
const SnowTheme = Quill.import("themes/snow");
const Delta = Quill.import("delta");

/**
 * Extended snow theme for custom 'link tooltip'
 */
class ExtendSnowTheme extends SnowTheme {
  constructor(quill, options) {
    super(quill, options);
    // flag that ensure only create/add our custom elements once
    this.tooltipModified = false;
    // listener for adding our custom input for link 'text'
    quill.on("selection-change", (range) => {
      if (this.tooltipModified) return;
      // mark flag
      this.tooltipModified = true;
      let tooltip = quill.theme.tooltip;
      let newText; // link text
      let index; // link start index
      let length; // link text length
      let linkValue; // link href value

      // custom save link text funtion
      const save = () => {
        let delta = new Delta()
          .retain(index)
          .delete(length)
          .insert(newText, {link: linkValue});
        quill.updateContents(delta);
      };

      // create input element
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "link text";
      input.addEventListener("input", (e) => {
        newText = e.target.value;
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          save();
          tooltip.root.classList.add("ql-hidden");
        }
      });

      // create input label
      const label = document.createElement("span");
      label.textContent = "Enter text: ";

      // modify tooltip root to replace psuedo elements
      const textInputContainer = document.createElement("div");
      textInputContainer.classList.add("link-text-container");
      textInputContainer.append(label, input);
      tooltip.root.insertBefore(textInputContainer, tooltip.root.firstChild);
      const linkInputLabel = document.createElement("span");
      linkInputLabel.textContent = "Enter link: ";
      tooltip.root.insertBefore(linkInputLabel, tooltip.textbox);

      // Modify original link textbox
      const textbox = tooltip.textbox;
      textbox.placeholder = "www.google.com";
      const setLinkValue = (e) => {
        linkValue = e.target.value;
      };
      // quill auto focus this textbox by default, so this ensure we get the value
      textbox.addEventListener("focus", setLinkValue);
      // if user update link, need to update value
      textbox.addEventListener("input", setLinkValue);

      // Hack 'ql-action' button
      const actionBtn = tooltip.root.querySelector(".ql-action");
      actionBtn.addEventListener("click", () => {
        if (tooltip.root.classList.contains("ql-hidden")) {
          save();
          return;
        }
        if (tooltip.root.classList.contains("ql-editing")) {
          index = tooltip.linkRange.index;
          length = tooltip.linkRange.length;
          // set default newText in case user does not change it
          newText = quill.getText(index, length);
          // now it's time to get and change link text input value
          input.value = newText;
        }
      });
    });
  }
}

Quill.register("themes/snow", ExtendSnowTheme);

// --- link stuff end ---

class QuillEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ""
    };
  }

  modules = {
    magicUrl: true
  };

  formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "imageBlot" // #5 Optinal if using custom formats
  ];

  render() {
    return (
      <ReactQuill
        theme="snow"
        modules={this.modules}
        formats={this.formats}
        value={this.state.text}
      >
        <div className="my-editing-area" />
      </ReactQuill>
    );
  }
}

export default QuillEditor;
