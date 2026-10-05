import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Archive, ArchiveRestore, BookOpen, Briefcase, CalendarDays, Camera, Car,
  CheckCircle2, ChevronDown, ChevronUp, Circle, CloudSun, Copy, Database,
  Download, Dumbbell, FileText, FolderPlus, Gift, HeartPulse, Home, Luggage,
  MapPin, Minus, MoreHorizontal, Plane, Plug, Plus, RotateCcw, Search, Shirt,
  Share2, Sparkles, Trash2, Upload, Utensils, Train, Footprints
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

function DiverIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="7" r="2.5" />
      <path d="M5.5 6.5h5" />
      <path d="M10.5 7h2.5l1.5 1.5" />
      <rect x="5" y="10" width="4" height="7" rx="2" />
      <path d="m9 11 5 3 3-1" />
      <path d="m7 17 4 3" />
      <path d="m5.5 17-3 3" />
      <path d="m11 20 2.5 1" />
      <path d="m2.5 20-1.5 2" />
      <rect x="2.5" y="10" width="2" height="6" rx="1" />
      <circle cx="19" cy="9" r="1" />
      <circle cx="21" cy="6" r="0.7" />
    </svg>
  );
}


function BusIcon({ className = "h-5 w-5" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M7 7h10M7 12h10M6 18v2M18 18v2"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>;
}


function ShipIcon({ className = "h-5 w-5" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M12 3v7M8 6h8M5 11l7-3 7 3-2 7H7l-2-7Z"/><path d="M3 20c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0"/></svg>;
}


const STORAGE_KEY = "packing-trips-stable-v2-icons";
const categoryColors = [
  "bg-cyan-100 text-cyan-700", "bg-lime-100 text-lime-700",
  "bg-fuchsia-100 text-fuchsia-700", "bg-orange-100 text-orange-700",
  "bg-slate-100 text-slate-700"
];
const iconOptions = [
  { value: "shirt", label: "Oblečení", Icon: Shirt },
  { value: "file", label: "Dokumenty", Icon: FileText },
  { value: "health", label: "Lékárna", Icon: HeartPulse },
  { value: "sparkles", label: "Kosmetika", Icon: Sparkles },
  { value: "sport", label: "Sport", Icon: Dumbbell },
  { value: "plug", label: "Elektronika", Icon: Plug },
  { value: "camera", label: "Foto", Icon: Camera },
  { value: "book", label: "Čtení", Icon: BookOpen },
  { value: "work", label: "Práce", Icon: Briefcase },
  { value: "food", label: "Jídlo", Icon: Utensils },
  { value: "car", label: "Auto", Icon: Car },
  { value: "weather", label: "Počasí", Icon: CloudSun },
  { value: "gift", label: "Dárky", Icon: Gift },
  { value: "luggage", label: "Zavazadlo", Icon: Luggage },
  { value: "diving", label: "Potápění", Icon: DiverIcon },
  { value: "other", label: "Ostatní", Icon: MoreHorizontal }
];
const iconMap = Object.fromEntries(iconOptions.map(({ value, Icon }) => [value, Icon]));
const tripIconOptions = [
  { value: "plane", label: "Letadlo", Icon: Plane },
  { value: "car", label: "Auto", Icon: Car },
  { value: "train", label: "Vlak", Icon: Train },
  { value: "bus", label: "Autobus", Icon: BusIcon },
  { value: "ship", label: "Loď", Icon: ShipIcon },
  { value: "walk", label: "Pěšky", Icon: Footprints },
  { value: "luggage", label: "Obecná cesta", Icon: Luggage },
];
const tripIconMap = Object.fromEntries(tripIconOptions.map(({ value, Icon }) => [value, Icon]));
const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const today = () => new Date().toISOString().slice(0, 10);

const makeStarterCategories = () => [
  { id: uid(), name: "Oblečení", icon: "shirt", color: "bg-violet-100 text-violet-700", collapsed: false, items: [
    { id: uid(), name: "Tričko", quantity: 3, packed: false }, { id: uid(), name: "Spodní prádlo", quantity: 4, packed: false }, { id: uid(), name: "Kalhoty", quantity: 2, packed: false }
  ]},
  { id: uid(), name: "Travel dokumenty", icon: "file", color: "bg-sky-100 text-sky-700", collapsed: false, items: [
    { id: uid(), name: "Cestovní pas / občanský průkaz", quantity: 1, packed: false }, { id: uid(), name: "Letenky / jízdenky", quantity: 1, packed: false }, { id: uid(), name: "Cestovní pojištění", quantity: 1, packed: false }
  ]},
  { id: uid(), name: "Lékárna", icon: "health", color: "bg-rose-100 text-rose-700", collapsed: false, items: [
    { id: uid(), name: "Pravidelně užívané léky", quantity: 1, packed: false }, { id: uid(), name: "Náplasti", quantity: 5, packed: false }
  ]},
  { id: uid(), name: "Kosmetika", icon: "sparkles", color: "bg-amber-100 text-amber-700", collapsed: false, items: [
    { id: uid(), name: "Zubní kartáček", quantity: 1, packed: false }, { id: uid(), name: "Opalovací krém", quantity: 1, packed: false }
  ]},
  { id: uid(), name: "Sportovní vybavení", icon: "sport", color: "bg-emerald-100 text-emerald-700", collapsed: false, items: [
    { id: uid(), name: "Sportovní obuv", quantity: 1, packed: false }, { id: uid(), name: "Sportovní oblečení", quantity: 2, packed: false }
  ]},
  { id: uid(), name: "Elektronika", icon: "plug", color: "bg-indigo-100 text-indigo-700", collapsed: false, items: [
    { id: uid(), name: "Nabíječka na telefon", quantity: 1, packed: false }, { id: uid(), name: "Powerbanka", quantity: 1, packed: false }
  ]}
];
const makeTrip = (name = "New Trip") => ({
  id: uid(),
  name,
  destination: "",
  startDate: today(),
  endDate: "",
  tripIcon: "plane",
  archived: false,
  createdAt: new Date().toISOString(),
  categories: makeStarterCategories(),
});
function CategoryIcon({ type, className = "h-5 w-5" }) { const Icon = iconMap[type] || MoreHorizontal; return <Icon className={className} />; }
function TripIcon({ type, className = "h-6 w-6" }) {
  const Icon = tripIconMap[type] || Plane;
  return <Icon className={className} />;
}
function TripIconPicker({ value, onChange }) {
  return <div className="grid grid-cols-5 gap-2">
    {tripIconOptions.map(({ value: option, label, Icon }) => <button key={option} type="button" onClick={() => onChange(option)} title={label} aria-label={label} className={`flex items-center justify-center rounded-xl border p-3 transition ${value === option ? "border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-200" : "border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:text-sky-600"}`}><Icon className="h-5 w-5" /></button>)}
  </div>;
}
function IconPicker({ value, onChange, compact = false }) {
  return <div className={`grid ${compact ? "grid-cols-5" : "grid-cols-5 sm:grid-cols-8"} gap-2`}>
    {iconOptions.map(({ value: option, label, Icon }) => <button key={option} type="button" onClick={() => onChange(option)} title={label} aria-label={label}
      className={`flex aspect-square items-center justify-center rounded-xl border transition ${value === option ? "border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-200" : "border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:text-sky-600"}`}>
      <Icon className="h-5 w-5" />
    </button>)}
  </div>;
}
function getStats(trip) { const items = trip?.categories?.flatMap(c => c.items || []) || []; const packed = items.filter(i => i.packed).length; return { total: items.length, packed, percent: items.length ? Math.round(packed / items.length * 100) : 0 }; }
function formatDate(value) { return value ? new Intl.DateTimeFormat("cs-CZ").format(new Date(`${value}T12:00:00`)) : ""; }
function escapeXml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

export default function PackingListApp() {
  const initialTripRef = useRef(null); if (!initialTripRef.current) initialTripRef.current = makeTrip("Moje první cesta");
  const [trips, setTrips] = useState([initialTripRef.current]);
  const [activeId, setActiveId] = useState(initialTripRef.current.id);
  const [view, setView] = useState("trips"); const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState(""); const [showPacked, setShowPacked] = useState(true);
  const [newItems, setNewItems] = useState({}); const [newQuantities, setNewQuantities] = useState({});
  const [newCategory, setNewCategory] = useState(""); const [newCategoryIcon, setNewCategoryIcon] = useState("other");
  const [showIconPicker, setShowIconPicker] = useState(false); const [editingIconId, setEditingIconId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  const excelImportModeRef = useRef("add");




  const [exportMessage, setExportMessage] = useState("");
  const [importMessage, setImportMessage] = useState("");
  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed.trips)) { setTrips(parsed.trips); setActiveId(parsed.activeId || parsed.trips[0]?.id || ""); } } } catch (e) { console.error("Načtení dat selhalo", e); } finally { setLoaded(true); } }, []);
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify({ trips, activeId })); }, [trips, activeId, loaded]);

  const activeTrip = trips.find(t => t.id === activeId) || null;
  const stats = useMemo(() => getStats(activeTrip), [activeTrip]);
  const normalizedSearch = search.trim().toLocaleLowerCase("cs");
  const updateTrip = (id, changes) => setTrips(current => current.map(t => t.id === id ? { ...t, ...changes } : t));
  const updateCategories = updater => setTrips(current => current.map(t => t.id === activeId ? { ...t, categories: updater(t.categories || []) } : t));
  const createTrip = () => { const trip = makeTrip(); setTrips(c => [trip, ...c]); setActiveId(trip.id); setView("list"); setSearch(""); };
  const openTrip = id => { setActiveId(id); setView("list"); setSearch(""); };
  const duplicateTrip = trip => { const copy = { ...trip, id: uid(), name: `${trip.name} – kopie`, archived: false, createdAt: new Date().toISOString(), categories: trip.categories.map(c => ({ ...c, id: uid(), items: c.items.map(i => ({ ...i, id: uid(), packed: false })) })) }; setTrips(c => [copy, ...c]); setActiveId(copy.id); setView("list"); };
  const deleteTrip = id => setTrips(current => { const remaining = current.filter(t => t.id !== id); if (activeId === id) setActiveId(remaining[0]?.id || ""); return remaining; });
  const updateItem = (categoryId, itemId, changes) => updateCategories(cs => cs.map(c => c.id === categoryId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...changes } : i) } : c));
  const addItem = categoryId => {
    const name = (newItems[categoryId] || "").trim();
    if (!name) return;

    const quantity = Math.max(
      1,
      Math.floor(Number(newQuantities[categoryId]) || 1)
    );

    updateCategories(categories =>
      categories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: [
                ...category.items,
                { id: uid(), name, quantity, packed: false },
              ],
            }
          : category
      )
    );

    setNewItems(current => ({ ...current, [categoryId]: "" }));
    setNewQuantities(current => ({ ...current, [categoryId]: "" }));
  };
  const removeItem = (categoryId, itemId) => updateCategories(cs => cs.map(c => c.id === categoryId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
  const addCategory = () => {
    const typedName = newCategory.trim();
    const selectedIcon = iconOptions.find(option => option.value === newCategoryIcon);
    const name = typedName || (newCategoryIcon !== "other" ? selectedIcon?.label : "");


    if (!name) return;


    updateCategories(categories => [
      ...categories,
      {
        id: uid(),
        name,
        icon: newCategoryIcon,
        color: categoryColors[categories.length % categoryColors.length],
        collapsed: false,
        items: [],
      },
    ]);


    setNewCategory("");
    setNewCategoryIcon("other");
    setShowIconPicker(false);
    setSearch("");
  };
  const changeCategoryIcon = (categoryId, icon) => { updateCategories(cs => cs.map(c => c.id === categoryId ? { ...c, icon } : c)); setEditingIconId(null); };
  const removeCategory = id => updateCategories(cs => cs.filter(c => c.id !== id));
  const toggleCategory = id => updateCategories(cs => cs.map(c => c.id === id ? { ...c, collapsed: !c.collapsed } : c));
  const resetChecks = () => updateCategories(cs => cs.map(c => ({ ...c, items: c.items.map(i => ({ ...i, packed: false })) })));
  const restoreDefaultCategories = () => {
    updateCategories(categories => {
      const existingNames = new Set(
        categories.map(category => category.name.trim().toLocaleLowerCase("cs"))
      );
      const missingDefaults = makeStarterCategories().filter(
        category => !existingNames.has(category.name.trim().toLocaleLowerCase("cs"))
      );
      return [...categories, ...missingDefaults];
    });
    setSearch("");
    setShowPacked(true);
  };
  const downloadBlob = (blob, name) => {
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, name);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 1500);
  };
  const safeName = value => (value || "balici-seznam").replace(/[^a-zA-Z0-9á-žÁ-Ž_-]+/g, "-");
  const exportExcel = () => {
  if (!activeTrip) {
    setExportMessage("Není otevřená žádná cesta k exportu.");
    return;
  }
  try {
    const rows = [
      ["Travel Packing List"],
      [],
      ["Název cesty", activeTrip.name],
      ["Destinace", activeTrip.destination || "Neuvedena"],
      ["Datum od", formatDate(activeTrip.startDate)],
      ["Datum do", formatDate(activeTrip.endDate)],
      [],
      ["Kategorie", "Položka", "Počet", "Sbaleno"],
      ...activeTrip.categories.flatMap(category =>
        (category.items || []).map(item => [
          category.name,
          item.name,
          Number(item.quantity) || 1,
          item.packed ? "Ano" : "Ne",
        ])
      ),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 24 },
      { wch: 42 },
      { wch: 10 },
      { wch: 12 },
    ];
    worksheet["!autofilter"] = {
      ref: `A8:D${Math.max(8, rows.length)}`,
    };
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Packing List"
    );
    XLSX.writeFile(
      workbook,
      `${safeName(activeTrip.name)}.xlsx`,
      {
        bookType: "xlsx",
        compression: true,
      }
    );
    setExportMessage(
      "Soubor XLSX byl vytvořen. Najdete ho ve Stažených souborech."
    );
    window.setTimeout(() => setExportMessage(""), 5000);
  } catch (error) {
    console.error("Export do XLSX selhal", error);
    setExportMessage(
      "Export do XLSX se nepodařil. Zkuste akci zopakovat."
    );
  }
};
  const openExcelImport = mode => {
    excelImportModeRef.current = mode;
    setImportMessage("");
    excelInputRef.current?.click();
  };

  const importExcel = async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportMessage("Načítám soubor…");

      const fileData = await file.arrayBuffer();
      const workbook = XLSX.read(fileData);
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("Soubor neobsahuje žádný list.");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        raw: false,
      });

      const normalizeHeader = value =>
        String(value ?? "")
          .trim()
          .toLocaleLowerCase("cs")
          .replace(/\s+/g, " ");

      const headerRowIndex = rows.findIndex(row => {
        const headers = row.map(normalizeHeader);
        return headers.includes("kategorie") && headers.includes("položka");
      });

      if (headerRowIndex === -1) {
        throw new Error(
          'V souboru nebyly nalezeny sloupce "Kategorie" a "Položka".'
        );
      }

      const headers = rows[headerRowIndex].map(normalizeHeader);
      const categoryIndex = headers.indexOf("kategorie");
      const itemIndex = headers.indexOf("položka");
      const quantityIndex = headers.indexOf("počet");
      const packedIndex = headers.indexOf("sbaleno");

      const dataRows = rows.slice(headerRowIndex + 1);
      const importedRows = dataRows
        .map((row, rowOffset) => {
          const categoryName = String(row[categoryIndex] ?? "").trim();
          const itemName = String(row[itemIndex] ?? "").trim();
          const rawQuantity = quantityIndex >= 0 ? row[quantityIndex] : 1;
          const quantity = Math.max(1, Math.floor(Number(rawQuantity) || 1));
          const packedText =
            packedIndex >= 0
              ? String(row[packedIndex] ?? "")
                  .trim()
                  .toLocaleLowerCase("cs")
              : "";
          const packed = ["ano", "true", "1", "yes", "sbaleno"].includes(
            packedText
          );

          return {
            sourceRow: headerRowIndex + rowOffset + 2,
            categoryName,
            itemName,
            quantity,
            packed,
          };
        });

      const validRows = importedRows.filter(
        row => row.categoryName && row.itemName
      );
      const skippedRows = importedRows.filter(
        row => !row.categoryName || !row.itemName
      ).length;

      if (validRows.length === 0) {
        throw new Error("V souboru nebyly nalezeny žádné platné položky.");
      }

      const categoryMap = new Map();

      validRows.forEach(row => {
        const categoryKey = row.categoryName.toLocaleLowerCase("cs");

        if (!categoryMap.has(categoryKey)) {
          categoryMap.set(categoryKey, {
            id: uid(),
            name: row.categoryName,
            icon: "other",
            color:
              categoryColors[categoryMap.size % categoryColors.length],
            collapsed: false,
            items: [],
          });
        }

        categoryMap.get(categoryKey).items.push({
          id: uid(),
          name: row.itemName,
          quantity: row.quantity,
          packed: row.packed,
        });
      });

      const importedCategories = Array.from(categoryMap.values());
      const importMode = excelImportModeRef.current;

      let addedItems = 0;
      let updatedItems = 0;
      let addedCategories = 0;

      if (importMode === "replace") {
        updateCategories(() => importedCategories);
      } else {
        const mergedCategories = (activeTrip?.categories || []).map(category => ({
          ...category,
          items: [...(category.items || [])],
        }));

        importedCategories.forEach(importedCategory => {
          const importedCategoryName = importedCategory.name
            .trim()
            .toLocaleLowerCase("cs");

          let targetCategory = mergedCategories.find(
            category =>
              category.name.trim().toLocaleLowerCase("cs") ===
              importedCategoryName
          );

          if (!targetCategory) {
            targetCategory = {
              ...importedCategory,
              items: [],
            };
            mergedCategories.push(targetCategory);
            addedCategories += 1;
          }

          importedCategory.items.forEach(importedItem => {
            const importedItemName = importedItem.name
              .trim()
              .toLocaleLowerCase("cs");

            const existingItemIndex = targetCategory.items.findIndex(
              item =>
                item.name.trim().toLocaleLowerCase("cs") === importedItemName
            );

            if (existingItemIndex >= 0) {
              const existingItem = targetCategory.items[existingItemIndex];
              targetCategory.items[existingItemIndex] = {
                ...existingItem,
                quantity: importedItem.quantity,
                packed: importedItem.packed,
              };
              updatedItems += 1;
            } else {
              targetCategory.items.push(importedItem);
              addedItems += 1;
            }
          });
        });

        updateCategories(() => mergedCategories);
      }

      setSearch("");
      setShowPacked(true);

      const categoryCount = importedCategories.length;
      const itemCount = validRows.length;
      const skippedNote = skippedRows
        ? ` Přeskočeno neplatných řádků: ${skippedRows}.`
        : "";

      setImportMessage(
        importMode === "replace"
          ? `Import dokončen. Seznam byl nahrazen: ${categoryCount} kategorií a ${itemCount} položek.${skippedNote}`
          : `Import dokončen. Přidáno ${addedCategories} kategorií a ${addedItems} nových položek, aktualizováno ${updatedItems} existujících položek.${skippedNote}`
      );

      window.setTimeout(() => setImportMessage(""), 8000);
    } catch (error) {
      console.error("Import XLSX selhal", error);
      setImportMessage(
        error instanceof Error ? error.message : "Import XLSX se nepodařil."
      );
    } finally {
      event.target.value = "";
    }
  };

  const copyForExcel = async () => {
    if (!activeTrip) {
      setExportMessage("Není otevřená žádná cesta ke kopírování.");
      return;
    }

    const tripInfo = [
      ["Název cesty", activeTrip.name],
      ["Destinace", activeTrip.destination || "Neuvedena"],
      ["Od", formatDate(activeTrip.startDate)],
      ["Do", formatDate(activeTrip.endDate)],
      [],
      ["Kategorie", "Položka", "Počet", "Sbaleno"],
    ];

    const itemRows = activeTrip.categories.flatMap(category =>
      (category.items || []).map(item => [
        category.name,
        item.name,
        Number(item.quantity) || 1,
        item.packed ? "Ano" : "Ne",
      ])
    );

    const text = [...tripInfo, ...itemRows]
      .map(row => row.join(String.fromCharCode(9)))
      .join(String.fromCharCode(10));


    const copyWithTextarea = () => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    };


    try {
      let copied = false;


      if (navigator.clipboard?.writeText && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch (clipboardError) {
          console.warn("Clipboard API nebylo povoleno, používám náhradní kopírování.", clipboardError);
        }
      }

      if (!copied) copied = copyWithTextarea();
      if (!copied) throw new Error("Kopírování nebylo prohlížečem povoleno");
      setExportMessage("Tabulka celé cesty byla zkopírována. V Excelu ji vložte pomocí Cmd+V.");
      window.setTimeout(() => setExportMessage(""), 7000);
    } catch (error) {
      console.error("Kopírování pro Excel selhalo", error);
      setExportMessage("Kopírování nebylo prohlížečem povoleno. Zkuste akci zopakovat.");
    }
  };

  const createBackupFile = () => {
    const name = `packing-backup-${today()}.json`;
    const content = JSON.stringify({ app: "Travel Packing List", version: 2, exportedAt: new Date().toISOString(), trips }, null, 2);
    return new File([content], name, { type: "application/json" });
  };
  const backup = () => {
    const file = createBackupFile();
    downloadBlob(file, file.name);
  };
  const shareBackup = async () => {
    const file = createBackupFile();
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          title: "Záloha cestovního balicího seznamu",
          text: "Kompletní záloha všech cest, kategorií a položek.",
          files: [file],
        });
        return;
      }
      downloadBlob(file, file.name);
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Sdílení zálohy selhalo", error);
        downloadBlob(file, file.name);
      }
    }
  };
  const restore = event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(String(reader.result)); if (!Array.isArray(data.trips)) throw new Error("Neplatná záloha"); setTrips(data.trips); setActiveId(data.trips[0]?.id || ""); setView("trips"); } catch (e) { console.error("Obnovení zálohy selhalo", e); } finally { event.target.value = ""; } }; reader.readAsText(file); };
  const filteredTrips = trips.filter(t => t.archived === showArchived && (!normalizedSearch || `${t.name} ${t.destination}`.toLocaleLowerCase("cs").includes(normalizedSearch)));

  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 pb-24 text-slate-900 md:pb-8">
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
      <button onClick={() => setView("trips")} className="flex min-w-0 items-center gap-3 text-left"><span className="rounded-2xl bg-sky-600 p-2.5 text-white shadow-lg"><Luggage className="h-6 w-6" /></span><span className="min-w-0"><span className="block text-xs font-medium text-sky-700">Travel Packing List</span><span className="block truncate text-lg font-bold">{view === "trips" ? "My Trip" : activeTrip?.name || "Balicí seznam"}</span></span></button>
      <div className="hidden gap-2 md:flex"><Button variant="outline" onClick={backup}><Download className="mr-2 h-4 w-4" />Záloha</Button><Button variant="outline" onClick={shareBackup}><Share2 className="mr-2 h-4 w-4" />Sdílet zálohu</Button><Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Obnovit</Button><Button onClick={createTrip} className="bg-sky-600"><Plus className="mr-2 h-4 w-4" />New Trip</Button></div>
      <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={restore} />
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
        onChange={importExcel}
      />
    </div></header>

    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {view === "trips" ? <>
        <section className="mb-6 rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-600 p-6 text-white shadow-xl sm:p-8"><p className="mb-2 text-sm font-semibold uppercase tracking-wider text-sky-100">Vaše cestovní plány</p><h1 className="text-3xl font-bold sm:text-4xl">Kam se chystáte?</h1><p className="mt-2 text-sky-100">Každá cesta má vlastní termín, destinaci a packing list.</p><Button variant="hero" onClick={createTrip} className="mt-5"><Plus className="mr-2 h-4 w-4" />Zadej New Trip</Button></section>
        <section className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hledat cestu nebo destinaci…" className="pl-10"/></div><div className="flex rounded-xl bg-slate-100 p-1"><Button size="sm" variant={!showArchived ? "default" : "ghost"} onClick={() => setShowArchived(false)}>Aktivní</Button><Button size="sm" variant={showArchived ? "default" : "ghost"} onClick={() => setShowArchived(true)}>Archiv</Button></div></section>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredTrips.map(trip => { const p = getStats(trip); return <Card key={trip.id} onClick={() => openTrip(trip.id)} className="cursor-pointer rounded-3xl border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><CardContent className="p-6"><div className="mb-5 flex justify-between"><span className="rounded-2xl bg-sky-100 p-3 text-sky-700"><TripIcon type={trip.tripIcon || "plane"}/></span><div onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" onClick={() => duplicateTrip(trip)}><Copy className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => updateTrip(trip.id, { archived: !trip.archived })}>{trip.archived ? <ArchiveRestore className="h-4 w-4"/> : <Archive className="h-4 w-4"/>}</Button><Button variant="ghost" size="icon" onClick={() => deleteTrip(trip.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4"/></Button></div></div><h2 className="truncate text-xl font-bold">{trip.name}</h2><p className="mt-2 flex gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4"/>{trip.destination || "Destinace neuvedena"}</p><p className="mt-1 flex gap-2 text-sm text-slate-500"><CalendarDays className="h-4 w-4"/>{formatDate(trip.startDate)}{trip.endDate ? ` – ${formatDate(trip.endDate)}` : ""}</p><div className="mt-5"><div className="mb-2 flex justify-between text-sm"><span>{p.packed} z {p.total} sbaleno</span><strong>{p.percent} %</strong></div><Progress value={p.percent}/></div></CardContent></Card>})}</div>
      </> : activeTrip ? <>
        <section className="mb-5 grid gap-4 lg:grid-cols-[1fr_320px]"><Card className="rounded-3xl border-0"><CardContent className="grid gap-4 p-5 sm:grid-cols-2"><div className="sm:col-span-2"><label className="text-xs font-semibold uppercase text-slate-400">Název cesty</label><Input value={activeTrip.name} onChange={e => updateTrip(activeId, { name: e.target.value })}/></div><div className="sm:col-span-2"><div className="mb-2 flex items-center justify-between"><label className="text-xs font-semibold uppercase text-slate-400">Ikona cesty</label><span className="text-xs text-slate-500">{tripIconOptions.find(option => option.value === (activeTrip.tripIcon || "plane"))?.label}</span></div><TripIconPicker value={activeTrip.tripIcon || "plane"} onChange={tripIcon => updateTrip(activeId, { tripIcon })}/></div><div><label className="text-xs font-semibold uppercase text-slate-400">Destinace</label><Input value={activeTrip.destination} onChange={e => updateTrip(activeId, { destination: e.target.value })}/></div><div className="grid grid-cols-2 gap-2"><Input type="date" value={activeTrip.startDate} onChange={e => updateTrip(activeId, { startDate: e.target.value })}/><Input type="date" value={activeTrip.endDate} onChange={e => updateTrip(activeId, { endDate: e.target.value })}/></div></CardContent></Card><Card className="rounded-3xl border-0"><CardContent className="p-5"><div className="mb-3 flex justify-between"><div><p className="text-sm text-slate-500">Průběh balení</p><p className="font-semibold">{stats.packed} z {stats.total} položek</p></div><strong className="text-3xl text-sky-700">{stats.percent} %</strong></div><Progress value={stats.percent}/><div className="mt-4 grid gap-2"><Button variant="outline" size="sm" onClick={resetChecks} className="w-full"><RotateCcw className="mr-2 h-4 w-4"/>Zrušit zaškrtnutí</Button><Button variant="outline" size="sm" onClick={restoreDefaultCategories} className="w-full"><FolderPlus className="mr-2 h-4 w-4"/>Obnovit výchozí kategorie</Button><Button size="sm" onClick={exportExcel} className="w-full bg-emerald-600 hover:bg-emerald-700"><Download className="mr-2 h-4 w-4"/>Exportovat do Excelu</Button>
<div className="grid grid-cols-2 gap-2">
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => openExcelImport("add")}
    className="min-w-0 border-sky-300 px-2 text-sky-700 hover:bg-sky-50"
    title="Přidat položky z Excelu k současnému seznamu"
  >
    <Upload className="mr-1 h-4 w-4 shrink-0" />
    <span className="truncate">Import přidat</span>
  </Button>
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => openExcelImport("replace")}
    className="min-w-0 border-amber-300 px-2 text-amber-700 hover:bg-amber-50"
    title="Nahradit současný seznam obsahem Excelu"
  >
    <RotateCcw className="mr-1 h-4 w-4 shrink-0" />
    <span className="truncate">Import nahradit</span>
  </Button>
</div>
<Button variant="outline" size="sm" onClick={copyForExcel} className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"><Copy className="mr-2 h-4 w-4"/>Kopírovat tabulku do Excelu</Button>
{exportMessage && <p role="status" aria-live="polite" className={`rounded-xl px-3 py-2 text-center text-xs font-medium ${exportMessage.startsWith("Soubor XLSX") || exportMessage.startsWith("Tabulka celé") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{exportMessage}</p>}
{importMessage && (
  <p
    role="status"
    aria-live="polite"
    className={`rounded-xl px-3 py-2 text-center text-xs font-medium ${
      importMessage.startsWith("Import dokončen")
        ? "bg-emerald-50 text-emerald-700"
        : importMessage === "Načítám soubor…"
          ? "bg-sky-50 text-sky-700"
          : "bg-rose-50 text-rose-700"
    }`}
  >
    {importMessage}
  </p>
)}</div></CardContent></Card></section>

        <section className="mb-5 rounded-2xl bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hledat položku nebo kategorii…" className="pl-10"/></div><label className="flex items-center gap-2 text-sm"><Checkbox checked={showPacked} onCheckedChange={v => setShowPacked(Boolean(v))}/>Zobrazit sbalené</label><div className="flex flex-1 gap-2"><Input value={newCategory} onChange={e => setNewCategory(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} placeholder="Nová kategorie"/><Button variant="outline" size="icon" onClick={() => setShowIconPicker(v => !v)} title="Vybrat ikonu"><CategoryIcon type={newCategoryIcon}/></Button><Button variant="outline" onClick={addCategory}><FolderPlus className="mr-2 h-4 w-4"/>Přidat</Button></div></div>
          {showIconPicker && <div className="mt-4 rounded-2xl border bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold">Vyberte ikonu nové kategorie</p><span className="text-xs text-slate-500">{iconOptions.find(i => i.value === newCategoryIcon)?.label}</span></div><IconPicker value={newCategoryIcon} onChange={setNewCategoryIcon}/></div>}
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-2">{activeTrip.categories.map(category => { const visibleItems = category.items.filter(item => { const matches = !normalizedSearch || item.name.toLocaleLowerCase("cs").includes(normalizedSearch) || category.name.toLocaleLowerCase("cs").includes(normalizedSearch); return matches && (showPacked || !item.packed); }); if (normalizedSearch && !visibleItems.length && !category.name.toLocaleLowerCase("cs").includes(normalizedSearch)) return null; return <Card key={category.id} className="overflow-hidden rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b p-4"><CardTitle className="flex min-w-0 items-center gap-3 text-lg"><button type="button" onClick={() => setEditingIconId(editingIconId === category.id ? null : category.id)} title="Změnit ikonu" className={`rounded-xl p-2.5 transition hover:ring-2 hover:ring-sky-300 ${category.color}`}><CategoryIcon type={category.icon}/></button><span className="truncate">{category.name}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">{category.items.length}</span></CardTitle><div><Button variant="ghost" size="icon" onClick={() => toggleCategory(category.id)}>{category.collapsed ? <ChevronDown className="h-4 w-4"/> : <ChevronUp className="h-4 w-4"/>}</Button><Button variant="ghost" size="icon" onClick={() => removeCategory(category.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4"/></Button></div></CardHeader>
          {editingIconId === category.id && <div className="border-b bg-slate-50 p-4"><p className="mb-3 text-sm font-semibold">Změnit ikonu kategorie</p><IconPicker compact value={category.icon} onChange={icon => changeCategoryIcon(category.id, icon)}/></div>}
          {!category.collapsed && <CardContent className="px-2 py-4 sm:px-3"><div className="space-y-2">{visibleItems.length ? visibleItems.map(item => (
  <div
    key={item.id}
    className={`flex w-full min-w-0 items-center gap-1 rounded-xl border px-1.5 py-2 ${
      item.packed
        ? "border-emerald-100 bg-emerald-50"
        : "border-slate-100 bg-slate-50"
    }`}
  >
    <button
      type="button"
      onClick={() => updateItem(category.id, item.id, { packed: !item.packed })}
      className="shrink-0"
      aria-label={item.packed ? `Označit položku ${item.name} jako nesbalenou` : `Označit položku ${item.name} jako sbalenou`}
    >
      {item.packed ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <Circle className="h-6 w-6 text-slate-300" />}
    </button>

    <div className="min-w-0 flex-1">
      <Input
        value={item.name}
        onChange={event => updateItem(category.id, item.id, { name: event.target.value })}
        className={`h-9 min-w-0 w-full border-0 bg-transparent px-1 ${item.packed ? "text-slate-400 line-through" : ""}`}
      />
    </div>

    <div className="grid w-[82px] shrink-0 grid-cols-[24px_34px_24px] items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        aria-label={`Snížit počet položky ${item.name}`}
        onClick={() => updateItem(category.id, item.id, { quantity: Math.max(1, (Number(item.quantity) || 1) - 1) })}
        className="flex h-9 w-6 items-center justify-center text-slate-600 transition hover:bg-slate-100 active:bg-slate-200"
      >
        <Minus className="h-4 w-4" />
      </button>

      <input
        type="number"
        min="1"
        inputMode="numeric"
        pattern="[0-9]*"
        value={item.quantity ?? ""}
        onChange={event => {
          const value = event.target.value;
          updateItem(category.id, item.id, {
            quantity: value === "" ? "" : Math.max(1, Math.floor(Number(value) || 1)),
          });
        }}
        onBlur={event => updateItem(category.id, item.id, { quantity: Math.max(1, Math.floor(Number(event.target.value) || 1)) })}
        aria-label={`Počet kusů položky ${item.name}`}
        className="h-9 w-[34px] min-w-0 appearance-none border-x border-slate-200 bg-white p-0 text-center text-sm outline-none"
      />

      <button
        type="button"
        aria-label={`Zvýšit počet položky ${item.name}`}
        onClick={() => updateItem(category.id, item.id, { quantity: (Number(item.quantity) || 1) + 1 })}
        className="flex h-9 w-6 items-center justify-center text-sky-700 transition hover:bg-sky-50 active:bg-sky-100"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>

    <Button
      variant="ghost"
      size="icon"
      onClick={() => removeItem(category.id, item.id)}
      className="h-9 w-7 shrink-0 p-0 text-slate-300 hover:text-red-600"
      aria-label={`Odstranit položku ${item.name}`}
      title="Smazat položku"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
)) : <p className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-400">Žádné položky</p>}</div>
<div className="mt-4 grid grid-cols-[minmax(0,1fr)_58px_42px] gap-2 sm:grid-cols-[minmax(0,1fr)_72px_auto]">
  <Input
    value={newItems[category.id] ?? ""}
    onChange={event => setNewItems(current => ({ ...current, [category.id]: event.target.value }))}
    onKeyDown={event => { if (event.key === "Enter") addItem(category.id); }}
    placeholder="Nová položka"
    className="min-w-0"
  />
  <Input
    type="number"
    min="1"
    inputMode="numeric"
    pattern="[0-9]*"
    value={newQuantities[category.id] ?? ""}
    placeholder="1"
    onChange={event => {
      const value = event.target.value;
      setNewQuantities(current => ({
        ...current,
        [category.id]: value === "" ? "" : Math.max(1, Math.floor(Number(value) || 1)),
      }));
    }}
    onBlur={event => {
      const value = event.target.value;
      if (value === "") return;
      setNewQuantities(current => ({ ...current, [category.id]: Math.max(1, Math.floor(Number(value) || 1)) }));
    }}
    onKeyDown={event => { if (event.key === "Enter") addItem(category.id); }}
    aria-label="Počet kusů nové položky"
    className="min-w-0 px-1 text-center"
  />
  <Button
    type="button"
    onClick={() => addItem(category.id)}
    className="min-w-0 bg-sky-600 px-2 hover:bg-sky-700 sm:px-4"
    aria-label="Přidat novou položku"
  >
    <Plus className="h-4 w-4 shrink-0" />
    <span className="hidden sm:inline">Přidat</span>
  </Button>
</div></CardContent>}
        </Card>})}</div>
      </> : <div className="rounded-3xl border-2 border-dashed bg-white p-12 text-center"><p className="mb-4 font-semibold">Zatím nemáte žádnou cestu.</p><Button onClick={createTrip}><Plus className="mr-2 h-4 w-4"/>Vytvořit cestu</Button></div>}
    </main>
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-white p-2 shadow-2xl md:hidden"><button onClick={() => setView("trips")} className="flex flex-col items-center gap-1 p-2 text-xs"><Home className="h-5 w-5"/>Cesty</button><button onClick={createTrip} className="flex flex-col items-center gap-1 p-2 text-xs"><Plus className="h-5 w-5"/>Nová</button><button onClick={backup} className="flex flex-col items-center gap-1 p-2 text-xs"><Database className="h-5 w-5"/>Záloha</button><button onClick={shareBackup} className="flex flex-col items-center gap-1 p-2 text-xs"><Share2 className="h-5 w-5"/>Sdílet</button><button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 p-2 text-xs"><Upload className="h-5 w-5"/>Obnovit</button></nav>
  </div>;
}
