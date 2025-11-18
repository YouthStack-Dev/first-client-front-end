import React from "react";
import OverviewSection from "./OverviewSection";
import StepsSection from "./StepsSection";
import GuidelinesSection from "./GuidelinesSection";
import TipsSection from "./TipsSection";

const ContentSection = ({ actionData }) => {
  if (!actionData) return null;

  return (
    <div className="space-y-6">
      <OverviewSection overview={actionData.overview} />
      <StepsSection steps={actionData.steps} />
      <GuidelinesSection guidelines={actionData.guidelines} />
      <TipsSection tips={actionData.tips} />
    </div>
  );
};

export default ContentSection;
