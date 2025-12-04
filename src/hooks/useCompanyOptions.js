import { useSelector } from "react-redux";

export const useCompanyOptions = () => {
  const { data: companies = [] } = useSelector((state) => state.company || {});

  const companyOptions = [
    { value: "", label: "All Companies" },
    ...companies.map((company) => ({
      value: company.tenant_id,
      label: company.name || `Company ${company.tenant_id}`,
    })),
  ];

  return companyOptions;
};
