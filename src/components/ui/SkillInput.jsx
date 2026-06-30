import { useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SKILL_GROUPS, ALL_SKILLS } from '../../data/formOptions';
import { listSkills, addSkill } from '../../api/skills';
import { Icon, ICO } from '../roster';

// Curated fallback options — shown when the tenant's master list is empty
// (fresh tenant) so the picker isn't blank.
const FALLBACK_GROUPS = Object.entries(SKILL_GROUPS).map(([group, skills]) => ({
  label: group,
  options: skills.map((s) => ({ value: s, label: s })),
}));

// react-select option for a known skill name.
export function optionFor(skillName) {
  const found = ALL_SKILLS.find((s) => s.value === skillName);
  return found ? { value: found.value, label: found.value } : { value: skillName, label: skillName };
}

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    borderRadius: 6,
    borderColor: state.isFocused ? 'var(--accent)' : 'var(--border)',
    boxShadow: state.isFocused ? '0 0 0 3px var(--accent-soft)' : 'none',
    fontSize: 13,
    '&:hover': { borderColor: 'var(--border-strong)' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    backgroundColor: state.isSelected
      ? 'var(--accent-soft)'
      : state.isFocused
        ? 'var(--surface-2)'
        : 'transparent',
    color: 'var(--text)',
  }),
  groupHeading: (base) => ({
    ...base,
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    paddingTop: 8,
  }),
  menu: (base) => ({ ...base, zIndex: 20 }),
};

export default function SkillInput({ skills, onChange }) {
  const selectRef = useRef(null);
  const queryClient = useQueryClient();

  // Tenant's master skill list — drives the option source so newly added
  // skills appear immediately for future picks.
  const { data: masterSkills = [] } = useQuery({
    queryKey: ['master-skills'],
    queryFn: listSkills,
  });

  // Persist a newly created skill to the master DB. Best-effort — if it fails,
  // the candidate still keeps the skill locally.
  const addMasterMutation = useMutation({
    mutationFn: addSkill,
    onSuccess: (data) => {
      queryClient.setQueryData(['master-skills'], (prev) => {
        const list = prev || [];
        return list.includes(data.skill_name) ? list : [...list, data.skill_name].sort();
      });
    },
  });

  // Use the master list when populated; fall back to the curated groups
  // for fresh tenants whose master list is still empty.
  const baseGroups = masterSkills.length > 0
    ? [{
        label: 'Your skills',
        options: masterSkills.map((s) => ({ value: s, label: s })),
      }]
    : FALLBACK_GROUPS;

  // Hide already-picked skills from the dropdown.
  const filteredGroups = baseGroups
    .map((g) => ({
      ...g,
      options: g.options.filter((o) => !skills.some((s) => s.skill_name === o.value)),
    }))
    .filter((g) => g.options.length > 0);

  const appendSkill = (skillName) => {
    const name = (skillName || '').trim();
    if (!name) return;
    if (skills.some((s) => s.skill_name.toLowerCase() === name.toLowerCase())) return;
    onChange([
      ...skills,
      { skill_name: name, proficiency: 'intermediate', years_of_experience: null },
    ]);
  };

  const handleSelect = (option) => {
    if (!option) return;
    appendSkill(option.value);
    setTimeout(() => selectRef.current?.focus(), 0);
  };

  // Fired when the user types a value that isn't an option and hits enter.
  // Add the literal value to the candidate immediately, and queue the master
  // DB write (which canonicalises to camelCase).
  const handleCreate = (input) => {
    const raw = (input || '').trim();
    if (!raw) return;
    appendSkill(raw);
    addMasterMutation.mutate(raw);
    setTimeout(() => selectRef.current?.focus(), 0);
  };

  const removeSkill = (index) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="col gap-3">
      <CreatableSelect
        ref={selectRef}
        options={filteredGroups}
        value={null}
        onChange={handleSelect}
        onCreateOption={handleCreate}
        placeholder="Pick a skill or type a new one (e.g. React Native)…"
        formatCreateLabel={(input) => `Add "${input}" as a new skill`}
        styles={selectStyles}
        isClearable={false}
        blurInputOnSelect={false}
        closeMenuOnSelect={false}
        createOptionPosition="first"
      />

      {skills.length === 0 ? (
        <div className="text-sm muted">No skills added yet. Pick from the dropdown above or type one.</div>
      ) : (
        <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
          {skills.map((skill, index) => (
            <span
              key={`${skill.skill_name}-${index}`}
              className="row gap-2"
              style={{
                alignItems: 'center',
                padding: '4px 4px 4px 10px',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-border)',
                borderRadius: 999,
                height: 28,
                fontSize: 12,
                color: 'oklch(0.40 0.16 264)',
                fontWeight: 500,
              }}
            >
              <span>{skill.skill_name}</span>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="row"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: 0,
                  background: 'transparent',
                  color: 'oklch(0.40 0.16 264)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  opacity: 0.7,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = 'transparent'; }}
                title="Remove"
              >
                <Icon d={ICO.x} size={11} sw={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
