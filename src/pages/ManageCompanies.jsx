import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import ToolBar from "../components/ui/ToolBar";
import { CreateCompanyForm } from "../components/modals/CreateCompanyForm";
import { useState } from "react";
import { MODULES } from "../staticData/Modules";

const ManageCompanies = () => {
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAdd = () => {
    setShowCreateCompany(true);
  };

  const getModuleName = (moduleId) => {
    return MODULES.find((m) => m.id === moduleId)?.name || moduleId;
  };

  const handleCreateCompany = (companyData) => {
    const newCompany = {
      ...companyData,
      id: `co-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCompanies((prev) => [...prev, newCompany]);
  };

  const allowedModules = [
    "routing",
    "manage-team",
    "scheduling-management",
    "manage-shift",
    "manage-shift-categories",
    "manage-drivers",
    "tracking",
    "transport-analytics",
    "user-management",
  ];

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.companyName.toLowerCase().includes(searchTerm.  toLowerCase())
  );

  return (
    <div>
      <ToolBar
        onAddClick={handleAdd}
        addButtonLabel="Add Company"
        addButtonIcon={<Plus size={16} />}
        className="p-4 bg-white border rounded shadow-sm"
      >
        <button className="px-3 py-2 border rounded">Export</button>
      </ToolBar>

      <div className="p-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredCompanies.map((company) => (
      <div
        key={company.id}
        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {company.companyName}
            </h3>
            <p className="text-sm text-gray-600 mb-1">{company.name}</p>
            <p className="text-sm text-gray-500">{company.email}</p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              company.status === "active"
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {company.status}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">
              Modules ({company.allowedModules.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {company.allowedModules.slice(0, 3).map((moduleId) => (
                <span
                  key={moduleId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600"
                >
                  {getModuleName(moduleId)}
                </span>
              ))}
              {company.allowedModules.length > 3 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  +{company.allowedModules.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-2">
            <span className="text-xs text-gray-400">
              Created {new Date(company.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center space-x-2">
              <button className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-yellow-500 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>



      <CreateCompanyForm
        isOpen={showCreateCompany}
        onClose={() => setShowCreateCompany(false)}
        onSubmit={handleCreateCompany}
        parentAllowedModules={allowedModules}
      />
    </div>
  );
};

export default ManageCompanies;
