import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import {
  Globe,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { SubXLogo } from '../SubXLogo';
import {
  isSupabaseConfigured,
  uploadImageToSupabaseStorage,
  deleteStorageFileFromSupabase
} from '../../lib/supabase';
import { OFFICIAL_SUBX_LOGO_URL, DEFAULT_SITE_SETTINGS } from '../../lib/store';
import { compressImage } from '../../lib/imageCompressor';

interface AdminBrandingTabProps {
  siteSettings?: SiteSettings;
  onUpdateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void> | void;
}

export const AdminBrandingTab: React.FC<AdminBrandingTabProps> = ({
  siteSettings,
  onUpdateSiteSettings,
}) => {
  const [brandingData, setBrandingData] = useState<SiteSettings>(() => {
    return siteSettings || DEFAULT_SITE_SETTINGS;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saveStatusMsg, setSaveStatusMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (siteSettings) {
      setBrandingData(siteSettings);
    }
  }, [siteSettings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setSaveErrorMsg(null);

    const prevLogo = brandingData.logoUrl;

    try {
      const { file: optimizedFile, dataUrl: compressedDataUrl } = await compressImage(file, 512, 512, 0.85);

      if (isSupabaseConfigured) {
        const res = await uploadImageToSupabaseStorage(optimizedFile, 'site-assets', optimizedFile.name);
        if (res.url) {
          if (
            prevLogo &&
            prevLogo !== res.url &&
            prevLogo !== OFFICIAL_SUBX_LOGO_URL &&
            prevLogo.includes('/storage/v1/object/public/')
          ) {
            deleteStorageFileFromSupabase(prevLogo).catch((err) => console.warn('Old logo cleanup warning:', err));
          }
          setBrandingData((prev) => ({ ...prev, logoUrl: res.url! }));
          setIsUploadingLogo(false);
          return;
        }
      }

      if (
        prevLogo &&
        prevLogo !== OFFICIAL_SUBX_LOGO_URL &&
        prevLogo.includes('/storage/v1/object/public/')
      ) {
        deleteStorageFileFromSupabase(prevLogo).catch((err) => console.warn('Old logo cleanup warning:', err));
      }
      setBrandingData((prev) => ({ ...prev, logoUrl: compressedDataUrl }));
    } catch (err) {
      setSaveErrorMsg('Failed to process logo file.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRevertOfficialLogo = () => {
    const prevLogo = brandingData.logoUrl;
    if (
      prevLogo &&
      prevLogo !== OFFICIAL_SUBX_LOGO_URL &&
      prevLogo.includes('/storage/v1/object/public/')
    ) {
      deleteStorageFileFromSupabase(prevLogo).catch((err) => console.warn('Old logo cleanup warning:', err));
    }
    setBrandingData((prev) => ({ ...prev, logoUrl: OFFICIAL_SUBX_LOGO_URL }));
    setSaveStatusMsg('Reset logo to official SubX emblem!');
    setTimeout(() => setSaveStatusMsg(null), 3000);
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveErrorMsg(null);

    try {
      const prevLogo = siteSettings?.logoUrl;
      const newLogo = brandingData.logoUrl;
      if (
        prevLogo &&
        prevLogo !== newLogo &&
        prevLogo !== OFFICIAL_SUBX_LOGO_URL &&
        prevLogo.includes('/storage/v1/object/public/')
      ) {
        deleteStorageFileFromSupabase(prevLogo).catch((err) => console.warn('Old logo cleanup warning:', err));
      }
      await onUpdateSiteSettings(brandingData);
      setSaveStatusMsg('Site branding & WhatsApp settings saved & synced to Supabase!');
      setTimeout(() => setSaveStatusMsg(null), 4000);
    } catch (err: any) {
      setSaveErrorMsg(err?.message || 'Failed to save branding settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      
      {/* Toast Feedback */}
      {saveStatusMsg && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{saveStatusMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-3.5 bg-red-950/90 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2 animate-fade-in shadow-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="font-semibold">{saveErrorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveBranding} className="space-y-6">
        
        {/* Brand Name & Tagline */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Globe className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Website Identity & Titles
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Store / Brand Name</label>
              <input
                type="text"
                value={brandingData.siteName}
                onChange={(e) => setBrandingData({ ...brandingData, siteName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-bold"
                placeholder="SubX Nepal"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tagline Slogan</label>
              <input
                type="text"
                value={brandingData.tagline}
                onChange={(e) => setBrandingData({ ...brandingData, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                placeholder="Nepal's #1 Digital Subscription Store"
                required
              />
            </div>
          </div>
        </div>

        {/* Logo Configuration & Live Preview */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Header Emblem / Logo
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-950 border border-slate-850 rounded-xl">
            {/* Live Header Logo Preview */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Live Header Preview</span>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center min-w-[140px]">
                <SubXLogo logoUrl={brandingData.logoUrl} size="md" />
              </div>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
                  {isUploadingLogo ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Upload Custom Logo (PNG / SVG)</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleRevertOfficialLogo}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Reset Official Logo
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={brandingData.logoUrl || ''}
                  onChange={(e) => setBrandingData({ ...brandingData, logoUrl: e.target.value })}
                  placeholder="Or enter direct image URL (https://...)"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp & Contact Routing */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              WhatsApp Order & Customer Service Routing
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                WhatsApp Destination Number (International format without +)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={brandingData.whatsappNumber}
                  onChange={(e) => setBrandingData({ ...brandingData, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none"
                  placeholder="9779765617156"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Direct WhatsApp link destination used when customers submit orders.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Display Phone Format (Visible to visitors)
              </label>
              <input
                type="text"
                value={brandingData.displayWhatsapp}
                onChange={(e) => setBrandingData({ ...brandingData, displayWhatsapp: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-bold"
                placeholder="+977 9765617156"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Formatted phone number shown on the website header and footer.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-300 mb-1">
              WhatsApp Community / Channel Invite Link
            </label>
            <input
              type="url"
              value={brandingData.whatsappCommunityUrl || ''}
              onChange={(e) => setBrandingData({ ...brandingData, whatsappCommunityUrl: e.target.value, whatsapp_community_url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none font-mono"
              placeholder="https://chat.whatsapp.com/CEUIi2YzvuaAaAvO11RmcS"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Destination URL opened when visitors click "Join WhatsApp Community" in the popup.
            </span>
          </div>
        </div>

        {/* Website Opening Announcement Popup (ON/OFF Switch & Settings) */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                Website Opening Community Popup Settings
              </h4>
            </div>

            {/* Quick Live Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const currentVal = brandingData.showAnnouncementPopup !== false && brandingData.show_announcement_popup !== false;
                const nextVal = !currentVal;
                setBrandingData({
                  ...brandingData,
                  showAnnouncementPopup: nextVal,
                  show_announcement_popup: nextVal
                });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border cursor-pointer ${
                brandingData.showAnnouncementPopup !== false && brandingData.show_announcement_popup !== false
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  brandingData.showAnnouncementPopup !== false && brandingData.show_announcement_popup !== false
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <span>
                {brandingData.showAnnouncementPopup !== false && brandingData.show_announcement_popup !== false
                  ? 'POPUP: ENABLED (ON)'
                  : 'POPUP: DISABLED (OFF)'}
              </span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={brandingData.showAnnouncementPopup !== false && brandingData.show_announcement_popup !== false}
                onChange={(e) => {
                  setBrandingData({
                    ...brandingData,
                    showAnnouncementPopup: e.target.checked,
                    show_announcement_popup: e.target.checked
                  });
                }}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  Show VIP WhatsApp Community Popup on First Website Visit
                </span>
                <span className="text-[11px] text-slate-400">
                  When enabled, visitors see the modern SaaS VIP modal inviting them to join the SubX Nepal WhatsApp group. When switched off, the popup is completely hidden.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Save Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-950/50 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving to Supabase...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Branding Settings</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
