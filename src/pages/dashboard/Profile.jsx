import { useState, useEffect, useRef, useCallback } from "react";
import { FiMail, FiEdit2, FiPlus, FiX, FiUser, FiUpload, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { useAuthModal } from "../../context/AuthModalContext";
import { supabase } from "../../supabaseClient";

const sanitizeInput = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/<\/?[^>]+(>|$)/g, "").trim();
};

export default function Profile() {
  const { user, loading: authLoading } = useAuthModal();
  const fileInputRef = useRef(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [currentRole, setCurrentRole] = useState("");
  const [currentRoleMeta, setCurrentRoleMeta] = useState("");
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [tempRole, setTempRole] = useState("");
  const [tempRoleMeta, setTempRoleMeta] = useState("");

  const [targetRegion, setTargetRegion] = useState("");
  const [targetRegionMeta, setTargetRegionMeta] = useState("");
  const [isEditingRegion, setIsEditingRegion] = useState(false);
  const [tempRegion, setTempRegion] = useState("");
  const [tempRegionMeta, setTempRegionMeta] = useState("");

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const [weeklyEmail, setWeeklyEmail] = useState(true);
  const [aiModel, setAiModel] = useState("Claude 3.5 Sonnet");

  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isEditingRole) setIsEditingRole(false);
        if (isEditingRegion) setIsEditingRegion(false);
        if (isAddingSkill) setIsAddingSkill(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditingRole, isEditingRegion, isAddingSkill]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        setEmail(user.email ?? "alex.chen@example.com");
        if (data) {
          setFirstName(data.first_name ?? "Alex");
          setLastName(data.last_name ?? "Chen");
          setAvatarUrl(data.avatar_url ?? "");
          setCurrentRole(data.role_title ?? "Senior Product Designer");
          setCurrentRoleMeta(data.role_title_meta ?? "Fintech / 5+ Years Exp.");
          setTargetRegion(data.target_region ?? "North America");
          setTargetRegionMeta(data.target_region_meta ?? "Remote or Hybrid (NYC)");
          setSkills(data.skills ?? ["UX Strategy", "Design Systems", "Figma", "User Research", "Prototyping"]);
          setWeeklyEmail(data.weekly_email ?? true);
          setAiModel(data.ai_model ?? "Claude 3.5 Sonnet");
        }
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        toast.error("Failed to load profile data");
      })
      .finally(() => setIsLoadingProfile(false));
  }, [user, authLoading]);

  const handleEditRoleClick = useCallback(() => {
    setTempRole(currentRole);
    setTempRoleMeta(currentRoleMeta);
    setIsEditingRole(true);
  }, [currentRole, currentRoleMeta]);

  const handleSaveRole = useCallback((e) => {
    e.preventDefault();
    const sanitizedRole = sanitizeInput(tempRole);
    const sanitizedMeta = sanitizeInput(tempRoleMeta);

    if (!sanitizedRole) {
      toast.error("Role cannot be empty");
      return;
    }
    setCurrentRole(sanitizedRole);
    setCurrentRoleMeta(sanitizedMeta);
    setIsEditingRole(false);
    toast.success("Current role updated");
  }, [tempRole, tempRoleMeta]);

  const handleEditRegionClick = useCallback(() => {
    setTempRegion(targetRegion);
    setTempRegionMeta(targetRegionMeta);
    setIsEditingRegion(true);
  }, [targetRegion, targetRegionMeta]);

  const handleSaveRegion = useCallback((e) => {
    e.preventDefault();
    const sanitizedRegion = sanitizeInput(tempRegion);
    const sanitizedMeta = sanitizeInput(tempRegionMeta);

    if (!sanitizedRegion) {
      toast.error("Region cannot be empty");
      return;
    }
    setTargetRegion(sanitizedRegion);
    setTargetRegionMeta(sanitizedMeta);
    setIsEditingRegion(false);
    toast.success("Target region updated");
  }, [tempRegion, tempRegionMeta]);

  const handleRemoveSkill = useCallback((skillToRemove) => {
    setSkills(prev => prev.filter((skill) => skill !== skillToRemove));
  }, []);

  const handleAddSkillSubmit = useCallback((e) => {
    e.preventDefault();
    const sanitizedSkill = sanitizeInput(newSkill);

    if (!sanitizedSkill) return;
    if (sanitizedSkill.length > 50) {
      toast.error("Skill name is too long (max 50 chars)");
      return;
    }
    if (skills.length >= 20) {
      toast.error("Maximum 20 skills allowed");
      return;
    }
    if (skills.includes(sanitizedSkill)) {
      toast.error("Skill already added");
      return;
    }
    setSkills(prev => [...prev, sanitizedSkill]);
    setNewSkill("");
    setIsAddingSkill(false);
  }, [newSkill, skills]);

  const handlePhotoUploadClick = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be smaller than 2MB");
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WebP)");
      return;
    }

    if (user) {
      const toastId = toast.loading("Uploading avatar...");
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

        setAvatarUrl(data.publicUrl);

        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({ id: user.id, avatar_url: data.publicUrl, updated_at: new Date().toISOString() });

        if (upsertError) throw upsertError;

        toast.success("Avatar uploaded successfully!", { id: toastId });

        if (typeof pendo !== "undefined") {
          pendo.track("avatar_uploaded", {
            fileType: file.type,
            fileSizeBytes: file.size,
            fileExtension: file.name.split('.').pop(),
          });
        }
      } catch (error) {
        console.error("Avatar upload error:", error);
        toast.error("Failed to upload avatar", { id: toastId });
      }
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        toast.success("Avatar updated locally! Click Save to apply changes.");
      };
      reader.readAsDataURL(file);
    }
  }, [user]);

  const handleSaveProfile = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    const profileData = {
      first_name: sanitizeInput(firstName),
      last_name: sanitizeInput(lastName),
      avatar_url: avatarUrl,
      role_title: sanitizeInput(currentRole),
      role_title_meta: sanitizeInput(currentRoleMeta),
      target_region: sanitizeInput(targetRegion),
      target_region_meta: sanitizeInput(targetRegionMeta),
      skills: skills,
      weekly_email: weeklyEmail,
      ai_model: aiModel,
    };

    if (user) {
      try {
        const { error } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            ...profileData,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success("Profile saved successfully!");

        if (typeof pendo !== "undefined") {
          pendo.track("profile_saved", {
            hasAvatar: !!avatarUrl,
            roleTitle: profileData.role_title,
            targetRegion: profileData.target_region,
            skillsCount: skills.length,
            weeklyEmailEnabled: weeklyEmail,
            aiModel,
            hasFirstName: !!profileData.first_name,
            hasLastName: !!profileData.last_name,
          });
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        toast.error(error.message || "Failed to save profile");
      }
    }

    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
    }, 2000);
  }, [
    isSaving, firstName, lastName, avatarUrl,
    currentRole, currentRoleMeta, targetRegion, targetRegionMeta,
    skills, weeklyEmail, aiModel, user
  ]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return (
    <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-10 sm:py-10 pb-20 md:pb-10 bg-white" style={{ scrollbarWidth: "none", WebkitScrollbarWidth: "none", msOverflowStyle: "none" }}>
      <div className="max-w-4xl w-full flex flex-col space-y-10 animate-fade-in">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 font-cabinet">
            Profile Settings
          </h1>
          <p className="mt-2 text-base text-zinc-500">
            Manage your personal information and professional context.
          </p>
        </div>

        {isLoadingProfile ? (
          <div className="animate-pulse space-y-8">
            <div className="h-48 bg-zinc-100 rounded-xl"></div>
            <div className="h-48 bg-zinc-100 rounded-xl"></div>
            <div className="h-32 bg-zinc-100 rounded-xl"></div>
          </div>
        ) : (
          <>
            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-zinc-900 border-b border-zinc-200 pb-2 font-cabinet w-full text-left">
                Personal Information
              </legend>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="flex flex-col items-center space-y-3">
                  <div
                    onClick={handlePhotoUploadClick}
                    role="button"
                    aria-label="Upload profile photo"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePhotoUploadClick(); }}
                    className="w-28 h-28 rounded-full border border-gray-200 bg-zinc-50 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-gray-300 transition-all"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${firstName} ${lastName}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-10 h-10 text-zinc-400" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiUpload className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    aria-label="File upload input"
                  />
                  <button
                    type="button"
                    onClick={handlePhotoUploadClick}
                    className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-300/65 transition-colors cursor-pointer"
                  >
                    Update Photo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 w-full">
                  <div>
                    <label htmlFor="first_name" className="text-[11px] font-semibold text-zinc-700 tracking-wider block mb-1.5 uppercase">
                      First Name
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="w-full py-2.5 px-3.5 border border-gray-300 rounded-lg text-zinc-800 focus:outline-none focus:ring focus:ring-gray-200 focus:border-transparent transition-all placeholder-zinc-400 bg-white text-base font-normal"
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="text-[11px] font-bold text-zinc-700 tracking-wider block mb-1.5 uppercase">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="w-full py-2.5 px-3.5 border border-gray-300 rounded-lg text-zinc-800 focus:outline-none focus:ring focus:ring-gray-200 focus:border-transparent transition-all placeholder-zinc-400 bg-white text-base font-normal"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email_address" className="text-[11px] font-bold text-zinc-700 tracking-wider block mb-1.5 uppercase">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <FiMail className="absolute left-3.5 text-zinc-400 w-5 h-5" />
                      <input
                        id="email_address"
                        type="email"
                        value={email}
                        readOnly
                        disabled
                        className="w-full py-2.5 pl-11 pr-4 border border-gray-300 rounded-lg text-zinc-400 bg-white cursor-not-allowed text-base font-normal"
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Your login email cannot be changed.
                    </p>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-6">
              <div>
                <legend className="text-xl font-semibold text-zinc-900 border-b border-zinc-200 pb-2 font-cabinet w-full text-left">
                  Career Context
                </legend>
                <p className="mt-1 text-sm text-zinc-500 pt-3">
                  This information helps the Copilot tailor your experience to specific hiring managers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="bg-white border border-zinc-200 rounded-xl p-5 relative group hover:border-zinc-300 transition-all flex flex-col justify-between min-h-36">
                  {!isEditingRole ? (
                    <>
                      <button
                        type="button"
                        onClick={handleEditRoleClick}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors p-1.5 rounded-full hover:bg-zinc-100 cursor-pointer"
                        aria-label="Edit Current Role"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-700 tracking-wider block mb-2 uppercase">
                          Current Role
                        </span>
                        <h3 className="text-lg font-semibold text-zinc-900">
                          {currentRole}
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1">
                          {currentRoleMeta}
                        </p>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSaveRole} className="w-full space-y-3">
                      <span className="text-[10px] font-bold text-zinc-700 tracking-wider block uppercase">
                        Edit Current Role
                      </span>
                      <label htmlFor="tempRole" className="sr-only">Role Title</label>
                      <input
                        id="tempRole"
                        autoFocus
                        type="text"
                        value={tempRole}
                        onChange={(e) => setTempRole(e.target.value)}
                        placeholder="Role title (e.g. Senior Product Designer)"
                        className="w-full py-1.5 px-3.5 border border-gray-300 rounded-lg text-zinc-800 focus:outline-none focus:ring focus:ring-gray-200 focus:border-transparent transition-all placeholder-zinc-400 bg-white text-base font-normal"
                      />
                      <label htmlFor="tempRoleMeta" className="sr-only">Role Metadata</label>
                      <input
                        id="tempRoleMeta"
                        type="text"
                        value={tempRoleMeta}
                        onChange={(e) => setTempRoleMeta(e.target.value)}
                        placeholder="Metadata (e.g. Fintech / 5+ Years Exp.)"
                        className="w-full py-1.5 px-3.5 border border-gray-300 rounded-lg text-zinc-800 focus:outline-none focus:ring focus:ring-gray-200 focus:border-transparent transition-all placeholder-zinc-400 bg-white text-base font-normal"
                      />
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingRole(false)}
                          className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-xs font-semibold text-white bg-[#f4330d] hover:bg-[#f4330d]/90 px-2.5 py-1 rounded transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-5 relative group hover:border-zinc-300 transition-all flex flex-col justify-between min-h-36">
                  {!isEditingRegion ? (
                    <>
                      <button
                        type="button"
                        onClick={handleEditRegionClick}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors p-1.5 rounded-full hover:bg-zinc-100 cursor-pointer"
                        aria-label="Edit Target Region"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-700 tracking-wider block mb-2 uppercase">
                          Target Region
                        </span>
                        <h3 className="text-lg font-semibold text-zinc-900">
                          {targetRegion}
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1">
                          {targetRegionMeta}
                        </p>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSaveRegion} className="w-full space-y-3">
                      <span className="text-[10px] font-bold text-zinc-400 tracking-wider block uppercase">
                        Edit Target Region
                      </span>
                      <label htmlFor="tempRegion" className="sr-only">Region Name</label>
                      <input
                        id="tempRegion"
                        autoFocus
                        type="text"
                        value={tempRegion}
                        onChange={(e) => setTempRegion(e.target.value)}
                        placeholder="Target Region (e.g. North America)"
                        className="w-full py-1.5 px-3 border border-gray-300 rounded-lg text-zinc-800 focus:outline-none focus:ring focus:ring-gray-200 focus:border-transparent transition-all placeholder-zinc-400 bg-white text-base font-normal"
                      />
                      <label htmlFor="tempRegionMeta" className="sr-only">Region Metadata</label>
                      <input
                        id="tempRegionMeta"
                        type="text"
                        value={tempRegionMeta}
                        onChange={(e) => setTempRegionMeta(e.target.value)}
                        placeholder="Metadata (e.g. Remote or Hybrid (NYC))"
                        className="w-full py-1.5 px-3 border border-gray-300 rounded-lg text-zinc-800 focus:outline-none focus:ring focus:ring-gray-200 focus:border-transparent transition-all placeholder-zinc-400 bg-white text-base font-normal"
                      />
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingRegion(false)}
                          className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-xs font-semibold text-white bg-[#f4330d] hover:bg-[#f4330d]/90 px-2.5 py-1 rounded transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-5 w-full md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <span className="text-[10px] font-bold text-zinc-700 tracking-wider uppercase">
                        Core Competencies
                      </span>
                      {!isAddingSkill ? (
                        <button
                          type="button"
                          onClick={() => setIsAddingSkill(true)}
                          className="text-xs font-bold text-[#f4330d] hover:text-[#f4330d]/80 cursor-pointer flex items-center gap-1 transition-colors px-2.5 py-1 rounded-md hover:bg-[#f4330d]/5"
                        >
                          <FiPlus className="w-3.5 h-3.5" /> Add Skill
                        </button>
                      ) : (
                        <form onSubmit={handleAddSkillSubmit} className="flex items-center space-x-2">
                          <label htmlFor="newSkill" className="sr-only">New Skill</label>
                          <input
                            id="newSkill"
                            autoFocus
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Type skill name"
                            className="w-full py-1 px-3 border border-gray-300 rounded-lg text-zinc-800 focus:outline-none focus:ring focus:ring-gray-200 focus:border-transparent transition-all placeholder-zinc-400 bg-white text-base font-normal"
                          />
                          <button
                            type="submit"
                            className="py-1.5 px-1.5 rounded text-white bg-[#f4330d] hover:bg-[#f4330d]/90 transition-colors cursor-pointer"
                            aria-label="Submit Skill"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewSkill("");
                              setIsAddingSkill(false);
                            }}
                            className="py-1.5 px-1.5 rounded bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors cursor-pointer"
                            aria-label="Cancel Skill"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </form>
                      )}
                    </div>

                    <div
                      className="flex flex-wrap gap-2 mt-4"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {skills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center space-x-1.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 text-sm font-medium px-3 py-1.5 rounded-full border border-zinc-200/50 transition-colors"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="cursor-pointer text-zinc-400 hover:text-red-500 transition-all font-semibold rounded-full p-0.5 hover:bg-zinc-200"
                            aria-label={`Remove ${skill}`}
                          >
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {skills.length === 0 && (
                        <p className="text-sm text-zinc-400 italic py-2">
                          No skills listed yet. Add skills above.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-6">
              <legend className="text-xl font-semibold text-zinc-900 border-b border-zinc-200 pb-2 font-cabinet w-full text-left">
                Account Preferences
              </legend>

              <div className="space-y-5 w-full max-w-xl">
                <div className="flex items-center justify-between p-1">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-800" id="weekly-email-label">
                      Weekly Career Report Email
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Receive automated summary profiles matches, market insights and reviews.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={weeklyEmail}
                    aria-labelledby="weekly-email-label"
                    onClick={() => setWeeklyEmail(!weeklyEmail)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 ${weeklyEmail ? "bg-[#f4330d]" : "bg-zinc-300"
                      }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${weeklyEmail ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <label htmlFor="aiModel" className="text-[11px] font-bold text-zinc-500 tracking-wider block uppercase">
                    AI Model Preference
                  </label>
                  <select
                    id="aiModel"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="py-2.5 px-3.5 border border-gray-300 rounded-lg text-zinc-800 focus:outline-none focus:ring focus:ring-gray-200 focus:border-transparent transition-all placeholder-zinc-400 bg-white w-full text-sm font-medium cursor-pointer"
                  >
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="Claude 3 Opus">Claude 3 Opus</option>
                    <option value="Claude 3 Haiku">Claude 3 Haiku</option>
                  </select>
                  <p className="text-xs text-zinc-500">
                    Select which AI model is utilized to process and rewrite your resume items.
                  </p>
                </div>
              </div>
            </fieldset>

            <div className="flex items-center justify-end border-t border-zinc-200 pt-6 mt-8 w-full">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-3 bg-[#111214] text-white font-medium rounded-lg hover:bg-[#111214]/80 transition-all flex items-center space-x-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-base shadow"
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <span>Save changes</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
