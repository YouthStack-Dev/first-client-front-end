import React, { useState, memo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import ManualToll from "../components/Toll/ManualToll";
import AutomatedToll from "../components/Toll/AutomatedToll";

const CollapsibleSection = memo(({ title, isOpen, onToggle, children }) => (
  <section className="border rounded-md mb-4 bg-white shadow">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 text-left text-lg font-medium bg-gray-100 hover:bg-gray-200 transition"
      aria-expanded={isOpen}
    >
      <span>{title}</span>
      {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
    </button>
    {isOpen && <div className="p-4 border-t">{children}</div>}
  </section>
));

const TollManagement = () => {
  const [sectionState, setSectionState] = useState({
    manual: true,
    automated: false,
  });

  const toggleSection = (key) => {
    setSectionState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <main className="p-4 w-full min-h-screen bg-gray-50">
      <CollapsibleSection
        title="Manual Toll"
        isOpen={sectionState.manual}
        onToggle={() => toggleSection("manual")}
      >
        <ManualToll />
      </CollapsibleSection>

      <CollapsibleSection
        title="Automated Toll"
        isOpen={sectionState.automated}
        onToggle={() => toggleSection("automated")}
      >
        <AutomatedToll />
      </CollapsibleSection>
    </main>
  );
};

export default TollManagement;
