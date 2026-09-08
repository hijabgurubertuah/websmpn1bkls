import React, { useState } from 'react';
import { SchoolConfig, NavMenu, DropdownItem } from '../../types';
import {
  Plus,
  Trash2,
  ChevronDown,
  Pencil,
  Check,
  X,
  GraduationCap,
  GripVertical,
  MoveUp,
  MoveDown,
} from 'lucide-react';

interface AdminMenusTabProps {
  config: SchoolConfig;
  onChange: (updated: SchoolConfig) => void;
}

export const AdminMenusTab: React.FC<AdminMenusTabProps> = ({ config, onChange }) => {
  const { navMenus } = config;

  const [activeOpenMenuId, setActiveOpenMenuId] = useState<string | null>(null);

  // Drag and Drop state for Main Menus
  const [draggedMenuIndex, setDraggedMenuIndex] = useState<number | null>(null);
  const [dragOverMenuIndex, setDragOverMenuIndex] = useState<number | null>(null);

  // Drag and Drop state for Sub Menus
  const [draggedSubIndex, setDraggedSubIndex] = useState<number | null>(null);
  const [dragOverSubIndex, setDragOverSubIndex] = useState<number | null>(null);

  // Main menu edit modal
  const [editingMenu, setEditingMenu] = useState<NavMenu | null>(null);
  const [menuFormLabel, setMenuFormLabel] = useState('');
  const [menuFormPath, setMenuFormPath] = useState('');
  const [menuFormIsDropdown, setMenuFormIsDropdown] = useState(false);
  const [menuFormEnabled, setMenuFormEnabled] = useState(true);

  // Sub-menu edit modal
  const [editingSubmenuParentId, setEditingSubmenuParentId] = useState<string | null>(null);
  const [editingSubmenuItem, setEditingSubmenuItem] = useState<DropdownItem | null>(null);
  const [subFormLabel, setSubFormLabel] = useState('');
  const [subFormPath, setSubFormPath] = useState('');

  // Add submenu inline
  const [addingSubmenuToMenuId, setAddingSubmenuToMenuId] = useState<string | null>(null);
  const [newSubLabel, setNewSubLabel] = useState('');
  const [newSubPath, setNewSubPath] = useState('#');

  const updateMenus = (updated: NavMenu[]) => {
    onChange({
      ...config,
      navMenus: updated,
    });
  };

  // Drag & Drop handlers for Main Menus
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedMenuIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent or data set
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverMenuIndex !== index) {
      setDragOverMenuIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedMenuIndex === null || draggedMenuIndex === dropIndex) {
      setDraggedMenuIndex(null);
      setDragOverMenuIndex(null);
      return;
    }

    const newMenus = [...navMenus];
    const [movedItem] = newMenus.splice(draggedMenuIndex, 1);
    newMenus.splice(dropIndex, 0, movedItem);

    updateMenus(newMenus);
    setDraggedMenuIndex(null);
    setDragOverMenuIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedMenuIndex(null);
    setDragOverMenuIndex(null);
  };

  // Drag & Drop handlers for Sub Menus
  const handleSubDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSubIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSubDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSubIndex !== index) {
      setDragOverSubIndex(index);
    }
  };

  const handleSubDrop = (e: React.DragEvent, menuId: string, dropIndex: number) => {
    e.preventDefault();
    if (draggedSubIndex === null || draggedSubIndex === dropIndex) {
      setDraggedSubIndex(null);
      setDragOverSubIndex(null);
      return;
    }

    updateMenus(
      navMenus.map((m) => {
        if (m.id === menuId && m.dropdownItems) {
          const newSubs = [...m.dropdownItems];
          const [movedItem] = newSubs.splice(draggedSubIndex, 1);
          newSubs.splice(dropIndex, 0, movedItem);
          return { ...m, dropdownItems: newSubs };
        }
        return m;
      })
    );

    setDraggedSubIndex(null);
    setDragOverSubIndex(null);
  };

  const handleSubDragEnd = () => {
    setDraggedSubIndex(null);
    setDragOverSubIndex(null);
  };

  const handleOpenEditMenu = (menu: NavMenu, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMenu(menu);
    setMenuFormLabel(menu.label);
    setMenuFormPath(menu.path);
    setMenuFormIsDropdown(menu.isDropdown);
    setMenuFormEnabled(menu.enabled);
  };

  const handleSaveMenuEdit = () => {
    if (!editingMenu || !menuFormLabel.trim()) return;

    updateMenus(
      navMenus.map((m) => {
        if (m.id === editingMenu.id) {
          const nextIsDropdown = menuFormIsDropdown;
          return {
            ...m,
            label: menuFormLabel.trim(),
            path: menuFormPath.trim() || '#',
            isDropdown: nextIsDropdown,
            enabled: menuFormEnabled,
            dropdownItems: nextIsDropdown ? m.dropdownItems || [] : undefined,
          };
        }
        return m;
      })
    );

    setEditingMenu(null);
  };

  const handleOpenEditSubmenu = (menuId: string, sub: DropdownItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSubmenuParentId(menuId);
    setEditingSubmenuItem(sub);
    setSubFormLabel(sub.label);
    setSubFormPath(sub.path);
  };

  const handleSaveSubmenuEdit = () => {
    if (!editingSubmenuParentId || !editingSubmenuItem || !subFormLabel.trim()) return;

    updateMenus(
      navMenus.map((m) => {
        if (m.id === editingSubmenuParentId) {
          return {
            ...m,
            dropdownItems: (m.dropdownItems || []).map((sub) =>
              sub.id === editingSubmenuItem.id
                ? {
                    ...sub,
                    label: subFormLabel.trim(),
                    path: subFormPath.trim() || '#',
                  }
                : sub
            ),
          };
        }
        return m;
      })
    );

    setEditingSubmenuItem(null);
    setEditingSubmenuParentId(null);
  };

  const handleCreateNewMenu = () => {
    const newId = `menu-${Date.now()}`;
    const newMenu: NavMenu = {
      id: newId,
      label: 'Menu Baru',
      path: '#',
      isDropdown: false,
      dropdownItems: [],
      enabled: true,
    };
    updateMenus([...navMenus, newMenu]);
    handleOpenEditMenu(newMenu);
  };

  const handleDeleteMenu = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Hapus menu ini?')) {
      updateMenus(navMenus.filter((m) => m.id !== id));
      if (activeOpenMenuId === id) setActiveOpenMenuId(null);
      if (editingMenu?.id === id) setEditingMenu(null);
    }
  };

  const handleAddSubmenu = (menuId: string) => {
    if (!newSubLabel.trim()) return;

    const newItem: DropdownItem = {
      id: `sub-${Date.now()}`,
      label: newSubLabel.trim(),
      path: newSubPath.trim() || '#',
    };

    updateMenus(
      navMenus.map((m) => {
        if (m.id === menuId) {
          return {
            ...m,
            isDropdown: true,
            dropdownItems: [...(m.dropdownItems || []), newItem],
          };
        }
        return m;
      })
    );

    setNewSubLabel('');
    setNewSubPath('#');
    setAddingSubmenuToMenuId(null);
    setActiveOpenMenuId(menuId);
  };

  const handleDeleteSubmenu = (menuId: string, subId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Hapus sub-menu ini?')) {
      updateMenus(
        navMenus.map((m) => {
          if (m.id === menuId) {
            return {
              ...m,
              dropdownItems: (m.dropdownItems || []).filter((item) => item.id !== subId),
            };
          }
          return m;
        })
      );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">

      {/* Header Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            Menu &amp; Dropdown
          </h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {navMenus.length}
          </span>
        </div>
      </div>

      {/* PPDB Toggle */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">Tombol PPDB</span>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange({
              ...config,
              ppdb: {
                ...(config.ppdb || {
                  enabled: true,
                  buttonLabel: 'Info PPDB 2026',
                  buttonLink: '#berita',
                  openInNewTab: false,
                  academicYear: '2026/2027',
                  statusText: 'Pendaftaran Dibuka',
                }),
                enabled: config.ppdb?.enabled === false ? true : false,
              },
            })
          }
          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            config.ppdb?.enabled !== false
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-slate-200 text-slate-700'
          }`}
        >
          {config.ppdb?.enabled !== false ? 'Aktif' : 'Nonaktif'}
        </button>
      </div>

      {/* Live Navbar Container with Drag and Drop */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        
        {/* Menu Items Row (Draggable) */}
        <div className="flex flex-wrap items-center gap-2">
          {navMenus.map((menu, index) => {
            const isOpen = activeOpenMenuId === menu.id;
            const isDropdown = menu.isDropdown;
            const isDragging = draggedMenuIndex === index;
            const isDragOver = dragOverMenuIndex === index;

            return (
              <div
                key={menu.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group transition-all cursor-grab active:cursor-grabbing ${
                  isDragging ? 'opacity-40 scale-95' : 'opacity-100'
                } ${
                  isDragOver ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                <div
                  onClick={() => {
                    if (isDropdown) {
                      setActiveOpenMenuId(isOpen ? null : menu.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-xl text-xs font-bold border transition-all select-none ${
                    isOpen
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-200'
                      : menu.enabled
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-slate-100 text-slate-400 border-dashed border-slate-300'
                  }`}
                >
                  <GripVertical className={`w-3 h-3 ${isOpen ? 'text-blue-200' : 'text-slate-400'} shrink-0`} />

                  <span className="truncate max-w-[150px]">{menu.label}</span>

                  {isDropdown && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        isOpen ? 'rotate-180 text-white' : 'text-slate-500'
                      }`}
                    />
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleOpenEditMenu(menu, e)}
                    className={`p-1 rounded-lg cursor-pointer transition-colors ${
                      isOpen
                        ? 'bg-blue-700 text-white hover:bg-blue-800'
                        : 'bg-white text-slate-600 hover:text-blue-600 border border-slate-300'
                    }`}
                    title="Edit"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteMenu(menu.id, e)}
                    className={`p-1 rounded-lg cursor-pointer transition-colors ${
                      isOpen
                        ? 'bg-blue-700 text-white hover:bg-red-600'
                        : 'bg-white text-slate-400 hover:text-red-600 border border-slate-300'
                    }`}
                    title="Hapus"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleCreateNewMenu}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-dashed border-blue-400 text-blue-700 bg-blue-50/50 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Sub-menu Dropdown List (Live Expanded) */}
        {activeOpenMenuId && (
          (() => {
            const activeMenu = navMenus.find((m) => m.id === activeOpenMenuId);
            if (!activeMenu) return null;
            const subItems = activeMenu.dropdownItems || [];

            return (
              <div className="bg-slate-50 border border-blue-400 rounded-xl p-4 space-y-3 animate-in fade-in duration-150">
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-800">
                      Sub-Menu: {activeMenu.label}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      {subItems.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditMenu(activeMenu, e)}
                      className="px-2 py-1 text-xs font-bold bg-white text-slate-700 hover:text-blue-600 border border-slate-300 rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit Menu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveOpenMenuId(null)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-items (Draggable) */}
                <div className="space-y-2">
                  {subItems.map((sub, sIndex) => {
                    const isSubDragging = draggedSubIndex === sIndex;
                    const isSubDragOver = dragOverSubIndex === sIndex;

                    return (
                      <div
                        key={sub.id}
                        draggable
                        onDragStart={(e) => handleSubDragStart(e, sIndex)}
                        onDragOver={(e) => handleSubDragOver(e, sIndex)}
                        onDrop={(e) => handleSubDrop(e, activeMenu.id, sIndex)}
                        onDragEnd={handleSubDragEnd}
                        className={`p-2.5 bg-white border rounded-lg flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-all ${
                          isSubDragging ? 'opacity-40 scale-98' : 'opacity-100'
                        } ${
                          isSubDragOver ? 'border-blue-500 ring-2 ring-blue-300' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                          <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-xs text-slate-800 truncate">{sub.label}</span>
                            <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-1.5 py-0.2 rounded shrink-0">
                              {sub.path}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditSubmenu(activeMenu.id, sub, e)}
                            className="px-2 py-1 text-xs font-bold bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-md cursor-pointer flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSubmenu(activeMenu.id, sub.id, e)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add sub-menu */}
                {addingSubmenuToMenuId === activeMenu.id ? (
                  <div className="p-3 bg-white border border-blue-300 rounded-xl space-y-2.5 animate-in fade-in duration-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newSubLabel}
                        onChange={(e) => setNewSubLabel(e.target.value)}
                        placeholder="Nama Sub-Menu"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newSubPath}
                        onChange={(e) => setNewSubPath(e.target.value)}
                        placeholder="Link Target"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAddingSubmenuToMenuId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSubmenu(activeMenu.id)}
                        disabled={!newSubLabel.trim()}
                        className="px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingSubmenuToMenuId(activeMenu.id)}
                    className="w-full py-2 border border-dashed border-blue-400 text-blue-700 bg-white hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Sub-Menu</span>
                  </button>
                )}

              </div>
            );
          })()
        )}

      </div>

      {/* Edit Main Menu Modal */}
      {editingMenu && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                Edit Menu
              </h3>
              <button
                type="button"
                onClick={() => setEditingMenu(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Label */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Menu
              </label>
              <input
                type="text"
                value={menuFormLabel}
                onChange={(e) => setMenuFormLabel(e.target.value)}
                placeholder="Nama Menu"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Menu Type Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMenuFormIsDropdown(false)}
                className={`p-2 rounded-lg border text-xs font-bold cursor-pointer ${
                  !menuFormIsDropdown
                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Link Tunggal
              </button>
              <button
                type="button"
                onClick={() => setMenuFormIsDropdown(true)}
                className={`p-2 rounded-lg border text-xs font-bold cursor-pointer ${
                  menuFormIsDropdown
                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Dropdown
              </button>
            </div>

            {/* Path */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Link Target
              </label>
              <input
                type="text"
                value={menuFormPath}
                onChange={(e) => setMenuFormPath(e.target.value)}
                placeholder="#sambutan / https://..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Toggle enabled & Delete action */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={menuFormEnabled}
                    onChange={(e) => setMenuFormEnabled(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Aktif</span>
                </label>

                <button
                  type="button"
                  onClick={(e) => handleDeleteMenu(editingMenu.id, e)}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMenu(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveMenuEdit}
                  disabled={!menuFormLabel.trim()}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit Sub-Menu Modal */}
      {editingSubmenuItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                Edit Sub-Menu
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingSubmenuItem(null);
                  setEditingSubmenuParentId(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Label */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Sub-Menu
              </label>
              <input
                type="text"
                value={subFormLabel}
                onChange={(e) => setSubFormLabel(e.target.value)}
                placeholder="Nama Sub-Menu"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Path */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Link Target
              </label>
              <input
                type="text"
                value={subFormPath}
                onChange={(e) => setSubFormPath(e.target.value)}
                placeholder="Link Target"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              {editingSubmenuParentId && (
                <button
                  type="button"
                  onClick={(e) => {
                    handleDeleteSubmenu(editingSubmenuParentId, editingSubmenuItem.id, e);
                    setEditingSubmenuItem(null);
                    setEditingSubmenuParentId(null);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubmenuItem(null);
                    setEditingSubmenuParentId(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveSubmenuEdit}
                  disabled={!subFormLabel.trim()}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
