import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import FormSteps from "./FormSteps";
import PersonalInfoForm from "./PersonalInfoForm";
import NavigationButtons from "./NavigationButtons";
import HeaderWithAction from "../HeaderWithAction";
import EmployeeAddressGoogleMapView from "../Map";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { logDebug, logError } from "../../utils/logger";
import { useDispatch, useSelector } from "react-redux";
import { selectAllTeams } from "../../redux/features/user/userSelectors";
import {
  addEmployeeToTeam,
  setTeams,
} from "../../redux/features/user/userSlice";
import { API_CLIENT } from "../../Api/API_Client";
import { useNavigate } from "react-router-dom";
import { fetchDepartments } from "../../redux/features/user/userTrunk";
import {
  validatePersonalInfo,
  validateAddressInfo,
  formatFormDataForValidation,
} from "./employeeSchema";
import endpoint from "../../Api/Endpoints";

const initialFormData = {
  name: "",
  email: "",
  gender: "",
  employee_code: "",
  phone: "",
  alternate_phone: "",
  address: "",
  landmark: "",
  latitude: null,
  longitude: null,
  distance_from_company: "",
  special_needs: "none",
  special_needs_start_date: null,
  special_needs_end_date: null,
  office: "",
  team_id: "",
  subscribe_via_email: false,
  subscribe_via_sms: false,
  employee_id: "",
};

const EmployeeForm = ({ mode = "create" }) => {
  const { state } = useLocation();
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState("personalInfo");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode !== "create");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const teams = useSelector(selectAllTeams);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [dateRangeSelection, setDateRangeSelection] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  if (mode === "view" && !state?.employee) {
    toast.error("Employee data not found");
    navigate(-1);
  }

  const tenantString = localStorage.getItem("tenant");

  if (tenantString) {
    const tenant = JSON.parse(tenantString);
    console.log("Tenant object:", tenant);
  } else {
    console.log("No tenant stored in localStorage");
  }

  const handleDateSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setDateRangeSelection([ranges.selection]);

    if (formData.special_needs !== "none") {
      setFormData((prev) => ({
        ...prev,
        special_needs_start_date: startDate.toISOString().split("T")[0],
        special_needs_end_date: endDate.toISOString().split("T")[0],
      }));
    }
  };

  const displayDateRange = () => {
    if (formData.special_needs === "none") return "";

    const { startDate, endDate } = dateRangeSelection[0];
    if (!startDate || !endDate) return "";
    return `${format(startDate, "yyyy-MM-dd")} - ${format(
      endDate,
      "yyyy-MM-dd"
    )}`;
  };

  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const response = await fetchDepartments();
        dispatch(setTeams(response));
      } catch (error) {
        logError("Error fetching teams:", error);
        toast.error("Failed to load departments");
      }
    };

    if (!teams || teams.length === 0) {
      fetchTeamsData();
    }
  }, [dispatch, teams]);

  useEffect(() => {
    if (mode !== "create") {
      const employee = state?.employee;

      logDebug("Employee data from state:", employee);
      if (employee) {
        const mappedData = {
          ...initialFormData,
          name: employee.name || "",
          employee_id: employee.employee_id || "",
          employee_code: employee.employee_code || "",
          email: employee.email || "",
          gender: employee.gender || "",
          phone: employee.phone || "",
          alternate_phone: employee.alternate_phone || "",
          special_needs: employee.special_needs || "none",
          special_needs_start_date:
            employee.special_needs === "none"
              ? null
              : employee.special_needs_start_date || null,
          special_needs_end_date:
            employee.special_needs === "none"
              ? null
              : employee.special_needs_end_date || null,
          team_id: employee.team_id || "",
          address: employee.address || "",
          landmark: employee.landmark || "",
          latitude: employee.latitude || null,
          longitude: employee.longitude || null,
          distance_from_company: employee.distance_from_company || "",
          office: employee.office || "",
          subscribe_via_email: employee.subscribe_via_email || false,
          subscribe_via_sms: employee.subscribe_via_sms || false,
        };
        setFormData(mappedData);

        if (
          employee?.special_needs !== "none" &&
          employee?.special_needs_start_date &&
          employee?.special_needs_end_date
        ) {
          setDateRangeSelection([
            {
              startDate: new Date(employee.special_needs_start_date),
              endDate: new Date(employee.special_needs_end_date),
              key: "selection",
            },
          ]);
        } else {
          setDateRangeSelection([
            {
              startDate: null,
              endDate: null,
              key: "selection",
            },
          ]);
        }
      }
      setIsLoading(false);
    }
  }, [mode, state]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    logDebug("Input change:", name, value);

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (name === "special_needs") {
      if (value === "none") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          special_needs_start_date: null,
          special_needs_end_date: null,
        }));

        setDateRangeSelection([
          {
            startDate: null,
            endDate: null,
            key: "selection",
          },
        ]);
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "team_id"
            ? value === ""
              ? ""
              : parseInt(value, 10)
            : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleNext = () => {
    if (currentStep === "personalInfo") {
      const formattedData = formatFormDataForValidation(formData);
      const validationResult = validatePersonalInfo(formattedData);

      if (!validationResult.isValid) {
        setErrors(validationResult.errors);
        logError("Validation errors:", validationResult.errors);

        const firstErrorKey = Object.keys(validationResult.errors)[0];
        toast.error(validationResult.errors[firstErrorKey]);
        return;
      }
    }

    setCurrentStep("address");
    if (!completedSteps.includes("personalInfo")) {
      setCompletedSteps((prev) => [...prev, "personalInfo"]);
    }
  };

  const handleBack = () => {
    setCurrentStep("personalInfo");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedData = formatFormDataForValidation(formData);
    const personalValidation = validatePersonalInfo(formattedData);
    const addressValidation = validateAddressInfo(formattedData);

    const allErrors = {
      ...personalValidation.errors,
      ...addressValidation.errors,
    };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      logDebug("Form submission errors:", allErrors);
      toast.error("Please fix all errors before submitting");
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = {
        name: formData.name?.trim() || "",
        email: formData.email?.trim() || "",
        gender: formData.gender || "",
        employee_code: formData.employee_code?.trim() || "",
        phone: formData.phone?.trim() || "",
        alternate_phone: formData.alternate_phone?.trim() || "",
        address: formData.address?.trim() || "",
        landmark: formData.landmark?.trim() || "",
        // Convert coordinates to numbers
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        team_id: formData.team_id ? parseInt(formData.team_id, 10) : null,
      };

      if (formData.special_needs === "none") {
        submissionData.special_needs = null;
        submissionData.special_needs_start_date = null;
        submissionData.special_needs_end_date = null;
      } else {
        submissionData.special_needs = formData.special_needs;

        if (formData.special_needs_start_date) {
          submissionData.special_needs_start_date =
            formData.special_needs_start_date;
        } else if (dateRangeSelection[0]?.startDate) {
          submissionData.special_needs_start_date =
            dateRangeSelection[0].startDate.toISOString().split("T")[0];
        } else {
          submissionData.special_needs_start_date = null;
        }

        if (formData.special_needs_end_date) {
          submissionData.special_needs_end_date =
            formData.special_needs_end_date;
        } else if (dateRangeSelection[0]?.endDate) {
          submissionData.special_needs_end_date = dateRangeSelection[0].endDate
            .toISOString()
            .split("T")[0];
        } else {
          submissionData.special_needs_end_date = null;
        }
      }

      Object.keys(submissionData).forEach((key) => {
        if (submissionData[key] === undefined || submissionData[key] === "") {
          delete submissionData[key];
        }
      });

      logDebug("Submission data:", submissionData);
      console.log(
        "Formatted submission data:",
        JSON.stringify(submissionData, null, 2)
      );

      const datawithpassword = { ...submissionData, password: "Password@123" };
      const response =
        mode === "create"
          ? await API_CLIENT.post(endpoint.createEmployee, datawithpassword)
          : await API_CLIENT.put(
              `${endpoint.updateEmployee}${userId}`,
              submissionData
            );

      if (response.status >= 200 && response.status < 300) {
        const employeeData = response.data; // Assuming API returns the created/updated employee

        toast.success(
          `Employee ${mode === "create" ? "created" : "updated"} successfully!`
        );

        // Dispatch to Redux store only for create mode and if team_id exists
        if (mode === "create" && formData.team_id) {
          // Assuming you have access to dispatch via useDispatch hook
          dispatch(
            addEmployeeToTeam({
              teamId: formData.team_id,
              employee: {
                ...employeeData,
                employee_id: formData.employee_id?.trim(), // Ensure employee_code is included
              },
            })
          );
        }

        if (mode === "create") {
          setFormData(initialFormData);
          setCurrentStep("personalInfo");
          setCompletedSteps([]);
          setDateRangeSelection([
            {
              startDate: null,
              endDate: null,
              key: "selection",
            },
          ]);
        }
        navigate(-1);
      } else {
        toast.error(
          response.data?.detail ||
            `Failed to ${mode === "create" ? "create" : "update"} employee`
        );
      }
    } catch (error) {
      logError("Submission error:", error);
      console.error("Full error object:", error);
      console.error("Error response:", error.response?.data);

      const errorData = error.response?.data;

      // Handle the array of validation errors in detail
      if (errorData?.detail && Array.isArray(errorData.detail)) {
        // Extract error messages from each validation error object
        errorData.detail.forEach((errorObj, index) => {
          if (errorObj.msg) {
            // Format the field name from the location array
            const fieldName =
              errorObj.loc && errorObj.loc.length > 1
                ? errorObj.loc[1]
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())
                : "Field";

            // Show the error message
            toast.error(`${fieldName}: ${errorObj.msg}`);
          }
        });
      }
      // Handle the "detail" object with conflict info (your previous case)
      else if (errorData?.detail && typeof errorData.detail === "object") {
        if (errorData.detail.details?.conflicting_fields) {
          const conflicts = errorData.detail.details.conflicting_fields;
          Object.keys(conflicts).forEach((fieldKey) => {
            const fieldValue = conflicts[fieldKey];
            const fieldName = fieldKey
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            toast.error(`${fieldName} "${fieldValue}" already exists`);
          });
        } else if (errorData.detail.message) {
          toast.error(errorData.detail.message);
        }
      }
      // Handle string message in detail
      else if (typeof errorData?.detail === "string") {
        toast.error(errorData.detail);
      }
      // Fallback to previous error structures
      else if (errorData?.errors) {
        const errorMessages = errorData.errors
          .map((err) => `${err.message}`)
          .join("\n");
        toast.error(errorMessages);
      } else {
        toast.error(
          errorData?.message ||
            error.message ||
            `Failed to ${mode === "create" ? "create" : "update"} employee`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFirstStep = currentStep === "personalInfo";
  const isLastStep = currentStep === "address";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4">Loading employee data...</span>
      </div>
    );
  }

  return (
    <>
      <HeaderWithAction
        title={
          mode === "create"
            ? "NEW EMPLOYEE"
            : mode === "edit"
            ? "EDIT EMPLOYEE"
            : "EMPLOYEE DETAILS"
        }
        showBackButton={true}
      />
      <div className="p-2 m-3 bg-white rounded-xl">
        {mode === "view" ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Personal Information</h2>
              <PersonalInfoForm
                formData={formData}
                onChange={handleInputChange}
                onCheckboxChange={handleCheckboxChange}
                errors={errors}
                isReadOnly={true}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                dateRangeSelection={dateRangeSelection}
                handleDateSelect={handleDateSelect}
                displayDateRange={displayDateRange}
                teams={teams}
              />
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Address Information</h2>
              <EmployeeAddressGoogleMapView
                formData={formData}
                setFormData={setFormData}
                setErrors={setErrors}
                isReadOnly={true}
              />
            </div>
            <NavigationButtons
              currentStep="complete"
              onSubmit={() => navigate(-1)}
              isLastStep={true}
              mode={mode}
            />
          </>
        ) : (
          <>
            <FormSteps
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
            <div className="mt-6 m-3">
              {currentStep === "personalInfo" ? (
                <PersonalInfoForm
                  formData={formData}
                  onChange={handleInputChange}
                  onCheckboxChange={handleCheckboxChange}
                  errors={errors}
                  isReadOnly={false}
                  showDatePicker={showDatePicker}
                  setShowDatePicker={setShowDatePicker}
                  dateRangeSelection={dateRangeSelection}
                  handleDateSelect={handleDateSelect}
                  displayDateRange={displayDateRange}
                  teams={teams}
                />
              ) : (
                <EmployeeAddressGoogleMapView
                  handleInputChange={handleInputChange}
                  formData={formData}
                  setFormData={setFormData}
                  setErrors={setErrors}
                  isReadOnly={false}
                />
              )}
            </div>
            <NavigationButtons
              currentStep={currentStep}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isLastStep={isLastStep}
              isFirstStep={isFirstStep}
              isSubmitting={isSubmitting}
              mode={mode}
            />
          </>
        )}
      </div>
    </>
  );
};

export default EmployeeForm;
