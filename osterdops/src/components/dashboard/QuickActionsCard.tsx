"use client";

import React, { useState } from "react";
import { PlusCircle, FolderPlus, Gauge, Calculator } from "lucide-react";
import { CreateBudgetModal } from "./CreateBudgetModal";

export function QuickActionsCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const handleActionClick = (actionName: string) => {
    setModalTitle(actionName);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="p-5 bg-[#0d0f18] border border-[#1d202e] rounded-2xl space-y-4">
        <h3 className="text-base font-semibold text-[#f4efe6]">Quick Actions</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Create Budget */}
          <button
            type="button"
            onClick={() => handleActionClick("Create Budget")}
            className="p-3 bg-[#111320] border border-[#1d202e] hover:border-[#dfba82]/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#181b2a] border border-[#262a3f] flex items-center justify-center text-[#dfba82] group-hover:scale-110 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-[#e8eaf0] group-hover:text-[#dfba82] transition-colors">
              Create Budget
            </span>
          </button>

          {/* Add Project */}
          <button
            type="button"
            onClick={() => handleActionClick("Add Project")}
            className="p-3 bg-[#111320] border border-[#1d202e] hover:border-[#dfba82]/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#181b2a] border border-[#262a3f] flex items-center justify-center text-[#dfba82] group-hover:scale-110 transition-transform">
              <FolderPlus className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-[#e8eaf0] group-hover:text-[#dfba82] transition-colors">
              Add Project
            </span>
          </button>

          {/* Rate Limits */}
          <button
            type="button"
            onClick={() => handleActionClick("Rate Limits")}
            className="p-3 bg-[#111320] border border-[#1d202e] hover:border-[#dfba82]/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#181b2a] border border-[#262a3f] flex items-center justify-center text-[#dfba82] group-hover:scale-110 transition-transform">
              <Gauge className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-[#e8eaf0] group-hover:text-[#dfba82] transition-colors">
              Rate Limits
            </span>
          </button>

          {/* Cost Simulator */}
          <button
            type="button"
            onClick={() => handleActionClick("Cost Simulator")}
            className="p-3 bg-[#111320] border border-[#1d202e] hover:border-[#dfba82]/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#181b2a] border border-[#262a3f] flex items-center justify-center text-[#dfba82] group-hover:scale-110 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-[#e8eaf0] group-hover:text-[#dfba82] transition-colors">
              Cost Simulator
            </span>
          </button>
        </div>
      </div>

      {/* Modal */}
      <CreateBudgetModal
        isOpen={isModalOpen}
        title={modalTitle}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
