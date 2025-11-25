import React, { useState } from "react";
// import Layout from "./Layout";
import ContentSection from "./sections/ContentSection";
import MediaSection from "./sections/MediaSection";
import FeaturesGrid from "./FeaturesGrid";
import { documentationData } from "./documentationData";
import Layout from "./layout/Layout";

const DocPage = () => {
  const [selectedModule, setSelectedModule] = useState("routing");
  const [selectedAction, setSelectedAction] = useState("createRoute");
  const [expandedModules, setExpandedModules] = useState(["routing"]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleModule = (moduleKey) => {
    if (expandedModules.includes(moduleKey)) {
      setExpandedModules(expandedModules.filter((m) => m !== moduleKey));
    } else {
      setExpandedModules([...expandedModules, moduleKey]);
    }
  };

  const selectAction = (moduleKey, actionKey) => {
    setSelectedModule(moduleKey);
    setSelectedAction(actionKey);
    if (!expandedModules.includes(moduleKey)) {
      setExpandedModules([...expandedModules, moduleKey]);
    }
  };

  const currentModule = documentationData[selectedModule];
  const currentAction = currentModule?.actions[selectedAction];

  return (
    <Layout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      documentationData={documentationData}
      selectedModule={selectedModule}
      selectedAction={selectedAction}
      expandedModules={expandedModules}
      toggleModule={toggleModule}
      selectAction={selectAction}
      headerTitle={currentAction?.title}
      headerDescription={currentAction?.description}
    >
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Content Sections */}
        <ContentSection actionData={currentAction} />

        {/* Right Column - Media */}
        <MediaSection content={currentAction?.content} />
      </div>

      {/* Features Grid at Bottom */}
      <FeaturesGrid />
    </Layout>
  );
};

export default DocPage;
