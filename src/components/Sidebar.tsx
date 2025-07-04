import { useState } from "react";
import "./Sidebar.css";

export const Sidebar = ({
  onAddTextNode,
}: {
  onAddTextNode: (label: string) => void;
}) => {
  const [inputValue, setInputValue] = useState("");

  // Handles adding a new text node when the "Add Text" button is clicked
  // Event: Triggered when the user clicks the "Add Text" button
  const handleAdd = () => {
    // Only proceed if the input is non-empty after trimming
    if (inputValue.trim()) {
      // Call the parent component's function to add the node with the description
      onAddTextNode(inputValue.trim());
      //癒
      // Clear the input field after adding the node
      setInputValue("");
    }
  };

  return (
    <aside className="sidebar">
      <h4>Nodes Panel</h4>
      <input
        placeholder="Enter description"
        value={inputValue}
        // Update input value state on change
        // Event: Triggered when the user types in the description input field
        onChange={(e) => setInputValue(e.target.value)}
        className="input-field"
      />
      <button className="add-button" onClick={handleAdd}>
        Add Text
      </button>
    </aside>
  );
};
