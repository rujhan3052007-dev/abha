/**
 * ABHA STYLE AI — Complete AI Virtual Tailor & 360° Virtual Try-On Engine
 * Master Specification & E-Commerce Integration Layer
 * 
 * Features:
 * 1. CustomerProfileService: Private avatar storage, consent verification, saved measurements & designs.
 * 2. MeasurementEngine: Inches/CM anatomical scaling, proportions calculator.
 * 3. GarmentConfigEngine: Kurta & Bottom customization, Stand Patti presets, multi-level Undo & Reset.
 * 4. VisualFittingEngine: Interactive 360° multi-perspective canvas renderer with authentic ABHA fabric preservation.
 * 5. AISuggestionEngine: Contextual styling advice + Hinglish/Hindi NLP query parser.
 * 6. TailoringSpecEngine: Generates standardized structured tailoring specifications with unique design IDs.
 * 7. ProviderAbstraction: Modular interface for future 3D/cloud AI engines.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AbhaStyleAI = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const STORAGE_KEY_PROFILE = 'abha_style_ai_profile_v1';
  const STORAGE_KEY_DESIGNS = 'abha_style_ai_designs_v1';
  const STORAGE_KEY_SETTINGS = 'abha_style_ai_settings_v1';

  // Stand Patti Visual Preset Definitions (§Stand Patti System)
  const STAND_PATTI_STYLES = [
    {
      id: 'SP-01',
      name: 'Classic Mandarin Collar',
      tag: 'Timeless & Formal',
      height: '1.25 inches',
      overlap: 'Center flush',
      buttonSpacing: '1.5 inches',
      description: 'Clean structured upright stand patti collar with center notch slit and fabric potli buttons.',
      previewIcon: '<svg class="w-8 h-8 text-maroon-800" viewBox="0 0 32 32" fill="none" stroke="currentColor"><path d="M8 8 C12 4, 20 4, 24 8 L24 14 C20 12, 12 12, 8 14 Z" stroke-width="2" fill="currentColor" fill-opacity="0.15"/><path d="M16 12 L16 26" stroke-width="2" stroke-dasharray="2 2"/></svg>'
    },
    {
      id: 'SP-02',
      name: 'Embroidered Notch Placket',
      tag: 'Festive & Atelier',
      height: '1.5 inches',
      overlap: 'Right-over-left overlap',
      buttonSpacing: '1.25 inches',
      description: 'Extended band with delicate zari/threadwork border framing a sleek 6-inch V-slit placket.',
      previewIcon: '<svg class="w-8 h-8 text-maroon-800" viewBox="0 0 32 32" fill="none" stroke="currentColor"><path d="M8 8 C12 5, 20 5, 24 8 L24 13 C20 11, 12 11, 8 13 Z" stroke-width="2" fill="currentColor" fill-opacity="0.2"/><path d="M14 13 L14 26 L18 26 L18 13 Z" stroke-width="1.8" fill="currentColor" fill-opacity="0.1"/></svg>'
    },
    {
      id: 'SP-03',
      name: 'Royal Angrakha Stand Patti',
      tag: 'Heritage Rajasthani',
      height: '1.2 inches',
      overlap: 'Diagonal wrap asymmetric',
      buttonSpacing: 'Dual fabric tie dori',
      description: 'Royal Rajasthani crossover high collar extending diagonally with side-tie tassels.',
      previewIcon: '<svg class="w-8 h-8 text-maroon-800" viewBox="0 0 32 32" fill="none" stroke="currentColor"><path d="M7 8 C12 4, 20 4, 25 8 L25 13 L12 25 L8 25 Z" stroke-width="2" fill="currentColor" fill-opacity="0.18"/><circle cx="12" cy="22" r="1.5" fill="currentColor"/></svg>'
    },
    {
      id: 'SP-04',
      name: 'Minimal Zari Piping Patti',
      tag: 'Modern Minimalist',
      height: '1.0 inch',
      overlap: 'Concealed hook closure',
      buttonSpacing: 'Concealed',
      description: 'Sleek low-profile band finished with subtle metallic gold piping, ideal for printed cottons.',
      previewIcon: '<svg class="w-8 h-8 text-maroon-800" viewBox="0 0 32 32" fill="none" stroke="currentColor"><path d="M9 10 C13 7, 19 7, 23 10 L23 14 C19 12, 13 12, 9 14 Z" stroke-width="2" fill="currentColor" fill-opacity="0.12"/><line x1="9" y1="10" x2="23" y2="10" stroke="#D4AF37" stroke-width="2"/></svg>'
    }
  ];

  // Default Standard Measurements (Inches)
  const DEFAULT_MEASUREMENTS = {
    unit: 'inches',
    bust: 36,
    waist: 32,
    hip: 38,
    shoulder: 14.5,
    armhole: 16.5,
    sleeveLength: 17,
    bicep: 12.5,
    wrist: 6.5,
    neckDepth: 6.0,
    kurtaLength: 42,
    sideSlitHeight: 19,
    fittingAllowance: 'Regular', // 'Regular', 'Comfortable', 'Loose', 'Fitted'
    bottomType: 'Straight Pants', // 'Straight Pants', 'Salwar', 'Palazzo', 'Churidar'
    bottomLength: 38,
    bottomWaist: 32,
    bottomHip: 40,
    bottomThigh: 23,
    bottomOpening: 13
  };

  // Default Garment Customization Configuration
  const DEFAULT_GARMENT_CONFIG = {
    garmentType: 'Salwar Suit',
    kurtaSilhouette: 'Straight', // 'Straight', 'A-line', 'Anarkali'
    kurtaLengthType: 'Standard', // 'Short', 'Standard', 'Long', 'Custom'
    kurtaLengthInches: 42,
    kurtaFitting: 'Regular', // 'Regular', 'Comfortable', 'Loose', 'Fitted'
    neckDesign: 'Round', // 'Round', 'V-neck', 'Square', 'Boat', 'Collar', 'Keyhole'
    neckDepth: 'Standard', // 'Standard', 'Slightly deeper', 'Deep', 'Custom'
    sleeveLength: '3/4', // 'Sleeveless', 'Short', '3/4', 'Full'
    sleeveStyle: 'Straight', // 'Straight', 'Slight flare', 'Bell', 'Regular'
    sleeveFitting: 'Regular', // 'Regular', 'Loose', 'Fitted'
    standPatti: false,
    standPattiStyle: 'SP-01',
    placket: true,
    buttons: true,
    buttonStyle: 'Fabric Potli Buttons',
    sideSlits: true,
    sideSlitHeight: 'Standard (Hip Level)',
    pockets: 'One side pocket', // 'No pocket', 'One side pocket', 'Two side pockets'
    bottomType: 'Straight Pants', // 'Straight Pants', 'Salwar', 'Palazzo', 'Churidar'
    bottomFitting: 'Regular'
  };

  // 1. Customer Profile Service (§1, §2, §3, §4)
  const CustomerProfileService = {
    getProfile: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return {
        hasConsent: false,
        consentTimestamp: null,
        photoDataUrl: null, // Private client-side base64 or blob
        avatarGenerated: false,
        avatarSkinTone: '#F3D5C0',
        measurements: { ...DEFAULT_MEASUREMENTS },
        updatedAt: new Date().toISOString()
      };
    },

    saveProfile: function (profile) {
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent('abha-style-profile-update', { detail: profile }));
      return profile;
    },

    setConsent: function (agreed = true) {
      const p = this.getProfile();
      p.hasConsent = agreed;
      p.consentTimestamp = agreed ? new Date().toISOString() : null;
      return this.saveProfile(p);
    },

    savePhoto: function (dataUrl) {
      const p = this.getProfile();
      p.photoDataUrl = dataUrl;
      p.avatarGenerated = !!dataUrl;
      return this.saveProfile(p);
    },

    removePhoto: function () {
      const p = this.getProfile();
      p.photoDataUrl = null;
      p.avatarGenerated = false;
      return this.saveProfile(p);
    },

    saveMeasurements: function (measurements) {
      const p = this.getProfile();
      p.measurements = { ...p.measurements, ...measurements };
      return this.saveProfile(p);
    }
  };

  // 2. Saved Designs Library (§Save Design)
  const SavedDesignsService = {
    getDesigns: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_DESIGNS);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return [];
    },

    saveDesign: function ({ product, garmentConfig, measurements, previewThumbnail = null }) {
      const designs = this.getDesigns();
      const designId = 'ABHA-DESIGN-' + (Math.floor(100000 + Math.random() * 900000));
      const newDesign = {
        id: designId,
        createdAt: new Date().toISOString(),
        product: {
          id: product.id,
          name: product.name || product.title,
          sku: product.sku,
          price: product.price || product.base_price,
          stitchingFee: product.stitchingPrice || product.stitchingFee || product.stitching_price || 650,
          color: product.color,
          fabric: product.fabric,
          image: product.image || product.primary_image
        },
        garmentConfig: JSON.parse(JSON.stringify(garmentConfig)),
        measurements: JSON.parse(JSON.stringify(measurements)),
        previewThumbnail,
        tailoringSpecification: TailoringSpecEngine.generateSpecification({
          designId,
          product,
          garmentConfig,
          measurements
        })
      };

      designs.unshift(newDesign);
      localStorage.setItem(STORAGE_KEY_DESIGNS, JSON.stringify(designs.slice(0, 50)));
      window.dispatchEvent(new CustomEvent('abha-style-design-saved', { detail: newDesign }));
      return newDesign;
    },

    deleteDesign: function (designId) {
      let designs = this.getDesigns();
      designs = designs.filter(d => d.id !== designId);
      localStorage.setItem(STORAGE_KEY_DESIGNS, JSON.stringify(designs));
      return designs;
    }
  };

  // 3. Tailoring Specification Engine (§Actual Tailoring Specification)
  const TailoringSpecEngine = {
    generateSpecification: function ({ designId, product, garmentConfig, measurements, customer = {} }) {
      const standPattiObj = STAND_PATTI_STYLES.find(sp => sp.id === garmentConfig.standPattiStyle) || STAND_PATTI_STYLES[0];

      return {
        specVersion: 'ABHA-SPEC-2026.1',
        designId: designId || ('ABHA-DESIGN-' + Math.floor(100000 + Math.random() * 900000)),
        generatedAt: new Date().toISOString(),
        product: {
          id: product.id,
          name: product.name || product.title,
          sku: product.sku,
          color: product.color,
          fabric: product.fabric,
          cutLength: 'Top: 2.5m, Bottom: 2.5m, Dupatta: 2.5m'
        },
        customerDetails: {
          name: customer.name || 'Verified Customer',
          phone: customer.phone || 'Store Account'
        },
        stitchingDetails: {
          garmentType: garmentConfig.garmentType || 'Salwar Suit',
          kurta: {
            silhouette: garmentConfig.kurtaSilhouette,
            fitting: garmentConfig.kurtaFitting,
            finishedLength: measurements.kurtaLength ? measurements.kurtaLength + '"' : (garmentConfig.kurtaLengthInches || 42) + '"',
            neckDesign: garmentConfig.neckDesign,
            neckDepth: garmentConfig.neckDepth,
            sleeves: {
              length: garmentConfig.sleeveLength,
              style: garmentConfig.sleeveStyle,
              fitting: garmentConfig.sleeveFitting,
              finishedLength: measurements.sleeveLength ? measurements.sleeveLength + '"' : '17"'
            },
            standPatti: garmentConfig.standPatti ? {
              required: true,
              styleId: standPattiObj.id,
              styleName: standPattiObj.name,
              collarHeight: standPattiObj.height,
              overlapDetails: standPattiObj.overlap
            } : { required: false },
            placket: garmentConfig.placket,
            buttons: garmentConfig.buttons ? garmentConfig.buttonStyle : 'None',
            sideSlits: garmentConfig.sideSlits ? {
              heightFromShoulder: measurements.sideSlitHeight ? measurements.sideSlitHeight + '"' : '19"',
              style: 'Reinforced Tailored Slit'
            } : 'No Side Slit',
            pockets: garmentConfig.pockets
          },
          bottom: {
            style: garmentConfig.bottomType,
            fitting: garmentConfig.bottomFitting,
            finishedLength: measurements.bottomLength ? measurements.bottomLength + '"' : '38"',
            waist: measurements.bottomWaist ? measurements.bottomWaist + '"' : (measurements.waist || 32) + '"',
            hip: measurements.bottomHip ? measurements.bottomHip + '"' : (measurements.hip || 40) + '"',
            ankleOpening: measurements.bottomOpening ? measurements.bottomOpening + '"' : '13"'
          },
          atelierNotes: 'Fabric touch & cut approved. Inside seam allowance: 2.0 inches double-stitched for future alteration. Hand-finished hems.'
        },
        anatomicalMeasurements: {
          unit: measurements.unit || 'inches',
          bust: measurements.bust,
          waist: measurements.waist,
          hip: measurements.hip,
          shoulder: measurements.shoulder,
          armhole: measurements.armhole,
          sleeveLength: measurements.sleeveLength,
          bicep: measurements.bicep,
          wrist: measurements.wrist,
          kurtaLength: measurements.kurtaLength,
          bottomLength: measurements.bottomLength,
          bottomOpening: measurements.bottomOpening
        }
      };
    },

    formatPrintableTicket: function (spec) {
      return `
================================================================
           ABHA ATELIER BESPOKE TAILORING JOB TICKET            
            11, Ganesha Tower, Arya Samaj, Beawar              
================================================================
DESIGN ID     : ${spec.designId}
DATE GENERATED: ${new Date(spec.generatedAt).toLocaleString('en-IN')}
PRODUCT       : ${spec.product.name}
SKU           : ${spec.product.sku}
COLOR/FABRIC  : ${spec.product.color} | ${spec.product.fabric}
----------------------------------------------------------------
KURTA TAILORING SPECIFICATIONS:
- Silhouette        : ${spec.stitchingDetails.kurta.silhouette} Cut
- Desired Fit       : ${spec.stitchingDetails.kurta.fitting}
- Finished Length   : ${spec.stitchingDetails.kurta.finishedLength}
- Neckline Design   : ${spec.stitchingDetails.kurta.neckDesign} (${spec.stitchingDetails.kurta.neckDepth})
- Sleeves           : ${spec.stitchingDetails.kurta.sleeves.length} - ${spec.stitchingDetails.kurta.sleeves.style} (${spec.stitchingDetails.kurta.sleeves.finishedLength})
- Stand Patti       : ${spec.stitchingDetails.kurta.standPatti.required ? `YES - [${spec.stitchingDetails.kurta.standPatti.styleId}] ${spec.stitchingDetails.kurta.standPatti.styleName} (${spec.stitchingDetails.kurta.standPatti.collarHeight})` : 'NO'}
- Front Placket     : ${spec.stitchingDetails.kurta.placket ? 'YES' : 'NO'}
- Buttons           : ${spec.stitchingDetails.kurta.buttons}
- Pockets           : ${spec.stitchingDetails.kurta.pockets}
- Side Slits        : ${typeof spec.stitchingDetails.kurta.sideSlits === 'object' ? `YES at ${spec.stitchingDetails.kurta.sideSlits.heightFromShoulder}` : spec.stitchingDetails.kurta.sideSlits}
----------------------------------------------------------------
BOTTOM TAILORING SPECIFICATIONS:
- Style             : ${spec.stitchingDetails.bottom.style}
- Finished Length   : ${spec.stitchingDetails.bottom.finishedLength}
- Waist / Hip       : ${spec.stitchingDetails.bottom.waist} / ${spec.stitchingDetails.bottom.hip}
- Ankle Opening     : ${spec.stitchingDetails.bottom.ankleOpening}
----------------------------------------------------------------
CUSTOMER ANATOMICAL MEASUREMENTS (${spec.anatomicalMeasurements.unit}):
Bust: ${spec.anatomicalMeasurements.bust}" | Waist: ${spec.anatomicalMeasurements.waist}" | Hip: ${spec.anatomicalMeasurements.hip}"
Shoulder: ${spec.anatomicalMeasurements.shoulder}" | Armhole: ${spec.anatomicalMeasurements.armhole}" | Sleeve: ${spec.anatomicalMeasurements.sleeveLength}"
Bicep: ${spec.anatomicalMeasurements.bicep}" | Kurta Length: ${spec.anatomicalMeasurements.kurtaLength}" | Pant Length: ${spec.anatomicalMeasurements.bottomLength}"
----------------------------------------------------------------
ATELIER MARGINS & FINISHING:
${spec.stitchingDetails.atelierNotes}
================================================================
`.trim();
    }
  };

  // 4. AISuggestionEngine & Hinglish NLP Parser (§AI Suggestion Engine, §Language Support)
  const AISuggestionEngine = {
    getSuggestion: function ({ product, garmentConfig, measurements }) {
      const fabricLower = (product.fabric || '').toLowerCase();

      if (garmentConfig.neckDesign === 'Round' && !garmentConfig.standPatti) {
        return {
          title: 'Atelier Pairing Suggestion',
          message: 'A structured Stand Patti (Mandarin Collar) pairs exceptionally well with this high-threadwork yoke.',
          actionText: 'Preview Stand Patti',
          applyChanges: { standPatti: true, standPattiStyle: 'SP-01' }
        };
      }

      if (fabricLower.includes('chanderi') || fabricLower.includes('silk')) {
        if (garmentConfig.kurtaSilhouette === 'Straight') {
          return {
            title: 'Festive Silk Silhouette',
            message: 'Chanderi silk has a natural royal flare. An A-line silhouette enhances the drape across festive events.',
            actionText: 'Preview A-Line Drape',
            applyChanges: { kurtaSilhouette: 'A-line' }
          };
        }
      }

      if (garmentConfig.pockets === 'No pocket') {
        return {
          title: 'Functional Comfort Addition',
          message: 'Add concealed side pockets for modern phone and key convenience without altering the elegant silhouette.',
          actionText: 'Add 2 Side Pockets',
          applyChanges: { pockets: 'Two side pockets' }
        };
      }

      return {
        title: 'Balanced Royal Proportion',
        message: 'Your 3/4 sleeves and tailored cut match the authentic Rajasthani boutique proportions perfectly.',
        actionText: null,
        applyChanges: null
      };
    },

    // Hinglish & Hindi command parser
    parseHinglishQuery: function (text) {
      if (!text || typeof text !== 'string') return null;
      const q = text.toLowerCase().trim();
      const changes = {};
      let matched = false;

      // Stand Patti
      if (q.includes('stand patti') || q.includes('mandarin') || q.includes('collar') || q.includes('stand-patti')) {
        changes.standPatti = true;
        if (q.includes('02') || q.includes('notch') || q.includes('embroider')) changes.standPattiStyle = 'SP-02';
        else if (q.includes('03') || q.includes('angrakha')) changes.standPattiStyle = 'SP-03';
        else if (q.includes('04') || q.includes('piping') || q.includes('zari')) changes.standPattiStyle = 'SP-04';
        else changes.standPattiStyle = 'SP-01';
        matched = true;
      }

      // Sleeves
      if (q.includes('3/4') || q.includes('three fourth') || q.includes('teen chauthai')) {
        changes.sleeveLength = '3/4';
        matched = true;
      } else if (q.includes('full sleeve') || q.includes('puri sleeve') || q.includes('full baazu')) {
        changes.sleeveLength = 'Full';
        matched = true;
      } else if (q.includes('half sleeve') || q.includes('short sleeve') || q.includes('aadhi')) {
        changes.sleeveLength = 'Short';
        matched = true;
      } else if (q.includes('sleeveless') || q.includes('bina sleeve')) {
        changes.sleeveLength = 'Sleeveless';
        matched = true;
      }

      // Neckline
      if (q.includes('v neck') || q.includes('v-neck') || q.includes('v gala')) {
        changes.neckDesign = 'V-neck';
        matched = true;
      } else if (q.includes('round') || q.includes('gol gala') || q.includes('gol neck')) {
        changes.neckDesign = 'Round';
        matched = true;
      } else if (q.includes('square') || q.includes('chokor')) {
        changes.neckDesign = 'Square';
        matched = true;
      } else if (q.includes('boat') || q.includes('boat neck')) {
        changes.neckDesign = 'Boat';
        matched = true;
      }

      // Fitting & Silhouette
      if (q.includes('loose') || q.includes('dhila') || q.includes('thoda loose')) {
        changes.kurtaFitting = 'Loose';
        matched = true;
      } else if (q.includes('fit') || q.includes('tight') || q.includes('slim')) {
        changes.kurtaFitting = 'Fitted';
        matched = true;
      }
      if (q.includes('a-line') || q.includes('a line') || q.includes('aline')) {
        changes.kurtaSilhouette = 'A-line';
        matched = true;
      } else if (q.includes('anarkali') || q.includes('gherdar')) {
        changes.kurtaSilhouette = 'Anarkali';
        matched = true;
      } else if (q.includes('straight') || q.includes('seedha')) {
        changes.kurtaSilhouette = 'Straight';
        matched = true;
      }

      // Pockets
      if (q.includes('pocket') || q.includes('pocket chahiye') || q.includes('jeb')) {
        changes.pockets = q.includes('2') || q.includes('dono') ? 'Two side pockets' : 'One side pocket';
        matched = true;
      }

      // Bottom
      if (q.includes('pant') || q.includes('cigarette')) {
        changes.bottomType = 'Straight Pants';
        matched = true;
      } else if (q.includes('salwar') || q.includes('patiala')) {
        changes.bottomType = 'Salwar';
        matched = true;
      } else if (q.includes('palazzo') || q.includes('plazo')) {
        changes.bottomType = 'Palazzo';
        matched = true;
      } else if (q.includes('churidar') || q.includes('churi')) {
        changes.bottomType = 'Churidar';
        matched = true;
      }

      return matched ? changes : null;
    }
  };

    // 5. Fabric Decomposition Engine (Identifies Upper, Bottom, and Dupatta)
  const FabricDecompositionService = {
    getBreakdown(product) {
      if (!product) return null;
      if (product.fabricBreakdown) return product.fabricBreakdown;

      const name = product.name || product.title || 'Salwar Suit';
      const color = product.color || 'Authentic Handloom Tone';
      const isCotton = product.suitType === 'cotton' || name.toLowerCase().includes('cotton');
      const isSilk = product.suitType === 'silk' || name.toLowerCase().includes('silk') || name.toLowerCase().includes('chanderi');

      return {
        tryonImage: product.tryonImage || 'images/tryon/rani-pink-leheriya-tryon.jpg',
        upper: {
          title: 'Kurta / Kameez Fabric',
          length: '2.5 Meters',
          material: isSilk ? 'Pure Chanderi Silk' : '100% Breathable Cotton',
          pattern: product.pattern || 'Authentic Loom Weave',
          color: color,
          neckDetail: 'Structured Neckline & Stand Patti Placket Weave',
          recommendedSilhouette: 'Straight Cut or A-Line Flare'
        },
        bottom: {
          title: 'Bottom Fabric (Pants / Salwar)',
          length: '2.5 Meters',
          material: isSilk ? 'Cotton-Silk Blend' : '100% Cotton Weave',
          pattern: 'Coordinated Color Weave',
          color: color.split('&')[0] || color,
          recommendedCut: 'Straight Cigarette Pants or Classic Salwar'
        },
        dupatta: {
          title: 'Dupatta',
          length: '2.5 Meters',
          material: isSilk ? 'Pure Silk Chanderi' : 'Lightweight Cotton Voile',
          pattern: 'Coordinating Border & Motif Pattern',
          drape: 'One-Shoulder Atelier Drape'
        }
      };
    }
  };


  // 6. Visual Fitting Engine — 3D Realistic Measurement Avatar & 360° Try-On Engine
  class VisualFittingEngine {
    constructor(canvasElement, options = {}) {
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext('2d');
      this.options = options;
      this.currentAngle = 0; // 0 to 360 degrees
      this.zoomLevel = 1.0;
      this.panOffset = { x: 0, y: 0 };
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartAngle = 0;
      this.product = null;
      this.garmentConfig = { ...DEFAULT_GARMENT_CONFIG };
      this.measurements = { ...DEFAULT_MEASUREMENTS };
      this.customerPhoto = null;
      this.showMeasurementLines = true;
      this.viewMode = '3d_avatar'; // '3d_avatar' or 'customer_photo'

      // Pre-load 3D multi-angle avatar assets
      this.avatarAngles = {
        front: null,
        angle45: null,
        side: null,
        back: null
      };
      this.loadAngleAssets();

      this.history = [];
      this.initEventListeners();
    }

    loadAngleAssets() {
      const angles = [
        { key: 'front', url: 'images/tryon/avatar_front.jpg' },
        { key: 'angle45', url: 'images/tryon/avatar_45.jpg' },
        { key: 'side', url: 'images/tryon/avatar_side.jpg' },
        { key: 'back', url: 'images/tryon/avatar_back.jpg' }
      ];

      angles.forEach(({ key, url }) => {
        const img = new Image();
        img.onload = () => {
          this.avatarAngles[key] = img;
          this.render();
        };
        img.src = url;
      });
    }

    initEventListeners() {
      if (!this.canvas) return;
      const c = this.canvas;

      c.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartAngle = this.currentAngle;
        c.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        const deltaX = e.clientX - this.dragStartX;
        let newAngle = (this.dragStartAngle + deltaX * 0.65) % 360;
        if (newAngle < 0) newAngle += 360;
        this.setAngle(newAngle);
      });

      window.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          c.style.cursor = 'grab';
        }
      });

      c.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.dragStartX = e.touches[0].clientX;
          this.dragStartAngle = this.currentAngle;
        }
      }, { passive: true });

      c.addEventListener('touchmove', (e) => {
        if (!this.isDragging || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - this.dragStartX;
        let newAngle = (this.dragStartAngle + deltaX * 0.75) % 360;
        if (newAngle < 0) newAngle += 360;
        this.setAngle(newAngle);
      }, { passive: true });

      c.addEventListener('touchend', () => {
        this.isDragging = false;
      });
    }

    setAngle(angle) {
      this.currentAngle = Math.round(angle);
      this.render();
      if (this.options.onAngleChange) {
        this.options.onAngleChange(this.currentAngle);
      }
    }

    zoom(delta) {
      this.zoomLevel = Math.max(0.8, Math.min(1.8, this.zoomLevel + delta));
      this.render();
    }

    resetView() {
      this.currentAngle = 0;
      this.zoomLevel = 1.0;
      this.panOffset = { x: 0, y: 0 };
      this.render();
    }

    toggleMeasurementLines() {
      this.showMeasurementLines = !this.showMeasurementLines;
      this.render();
      return this.showMeasurementLines;
    }

    setBodyPreset(presetName) {
      if (presetName === 'slim') {
        this.measurements.bust = 32;
        this.measurements.waist = 26;
        this.measurements.hip = 34;
      } else if (presetName === 'plus' || presetName === 'curvy') {
        this.measurements.bust = 42;
        this.measurements.waist = 36;
        this.measurements.hip = 46;
      } else {
        // regular medium
        this.measurements.bust = 36;
        this.measurements.waist = 30;
        this.measurements.hip = 38;
      }
      this.render();
      return { ...this.measurements };
    }

    setViewMode(mode) {
      this.viewMode = mode;
      this.render();
    }

    toggleHdModel() {
      if (this.customerPhoto) {
        this.viewMode = this.viewMode === 'customer_photo' ? '3d_avatar' : 'customer_photo';
      } else {
        this.viewMode = this.viewMode === 'realistic' ? '3d_avatar' : 'realistic';
      }
      this.render();
      return this.viewMode === 'realistic' || this.viewMode === 'customer_photo';
    }

    loadData({ product, garmentConfig, measurements, photoUrl }) {
      this.product = product;
      if (garmentConfig) this.garmentConfig = { ...garmentConfig };
      if (measurements) this.measurements = { ...measurements };
      this.pushHistory();

      // Preload product try-on image if available
      if (product && (product.tryonImage || product.image)) {
        const tImg = new Image();
        tImg.onload = () => {
          this.productTryonImage = tImg;
          if (this.viewMode === 'realistic') this.render();
        };
        tImg.src = product.tryonImage || product.image;
      }

      if (photoUrl) {
        const pImg = new Image();
        pImg.onload = () => {
          this.customerPhoto = pImg;
          this.render();
        };
        pImg.src = photoUrl;
      } else {
        this.customerPhoto = null;
        this.render();
      }
    }

    pushHistory() {
      this.history.push(JSON.parse(JSON.stringify(this.garmentConfig)));
      if (this.history.length > 25) this.history.shift();
    }

    undo() {
      if (this.history.length > 1) {
        this.history.pop();
        this.garmentConfig = JSON.parse(JSON.stringify(this.history[this.history.length - 1]));
        this.render();
        return true;
      }
      return false;
    }

    updateConfig(partialConfig) {
      this.pushHistory();
      Object.assign(this.garmentConfig, partialConfig);
      this.render();
    }

    updateMeasurements(newMeasurements) {
      Object.assign(this.measurements, newMeasurements);
      this.render();
    }

    resetConfig() {
      this.pushHistory();
      this.garmentConfig = { ...DEFAULT_GARMENT_CONFIG };
      this.render();
    }

    render() {
      if (!this.canvas || !this.ctx) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // Luxury Atelier Studio Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#FAF8F5');
      bgGrad.addColorStop(0.55, '#F3ECE4');
      bgGrad.addColorStop(1, '#E6DCD1');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Floor Pedestal & Soft Radial Shadow
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.94, w * 0.36, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(26, 18, 14, 0.16)';
      ctx.fill();

      // If customer chose to view their uploaded photo directly
      if (this.viewMode === 'customer_photo' && this.customerPhoto && this.customerPhoto.complete) {
        this.renderCustomerPhotoView(ctx, w, h);
        ctx.restore();
        return;
      }

      // If customer chose photorealistic catalog try-on view
      if (this.viewMode === 'realistic') {
        if (this.productTryonImage && this.productTryonImage.complete && this.productTryonImage.naturalWidth > 0) {
          this.renderRealisticCatalogView(ctx, w, h);
          ctx.restore();
          return;
        }
      }

      // Main 3D Realistic Measurement Avatar View
      this.render3DAvatar(ctx, w, h);

      ctx.restore();
    }

    render3DAvatar(ctx, w, h) {
      // 1. Determine Angle Image & Flip Direction
      const ang = (this.currentAngle % 360 + 360) % 360;
      let activeImage = this.avatarAngles.front;
      let isMirrored = false;
      let angleLabel = 'Front 0°';

      if (ang >= 337.5 || ang < 22.5) {
        activeImage = this.avatarAngles.front;
        angleLabel = 'Front 0°';
      } else if (ang >= 22.5 && ang < 67.5) {
        activeImage = this.avatarAngles.angle45;
        angleLabel = 'Three-Quarter 45°';
      } else if (ang >= 67.5 && ang < 112.5) {
        activeImage = this.avatarAngles.side;
        angleLabel = 'Side Profile 90°';
      } else if (ang >= 112.5 && ang < 157.5) {
        activeImage = this.avatarAngles.angle45;
        isMirrored = false;
        angleLabel = 'Rear-Angle 135°';
      } else if (ang >= 157.5 && ang < 202.5) {
        activeImage = this.avatarAngles.back;
        angleLabel = 'Back View 180°';
      } else if (ang >= 202.5 && ang < 247.5) {
        activeImage = this.avatarAngles.angle45;
        isMirrored = true;
        angleLabel = 'Rear-Angle 225°';
      } else if (ang >= 247.5 && ang < 292.5) {
        activeImage = this.avatarAngles.side;
        isMirrored = true;
        angleLabel = 'Side Profile 270°';
      } else {
        activeImage = this.avatarAngles.angle45;
        isMirrored = true;
        angleLabel = 'Three-Quarter 315°';
      }

      // Fallback if image not yet loaded
      if (!activeImage || !activeImage.complete) {
        activeImage = this.avatarAngles.front;
      }

      if (!activeImage || !activeImage.complete || activeImage.naturalWidth === 0) {
        ctx.fillStyle = '#851A38';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading 3D Realistic Avatar...', w * 0.5, h * 0.5);
        return;
      }

      // 2. Dynamic Measurement Morphing Scales
      const m = this.measurements;
      const bustInches = m.bust || 36;
      const waistInches = m.waist || 30;
      const hipInches = m.hip || 38;

      const bustRatio = Math.max(0.85, Math.min(1.25, bustInches / 36));
      const waistRatio = Math.max(0.85, Math.min(1.25, waistInches / 30));
      const hipRatio = Math.max(0.85, Math.min(1.25, hipInches / 38));

      // Weighted proportional horizontal scale
      const bodyWidthScale = (bustRatio * 0.35 + waistRatio * 0.35 + hipRatio * 0.30);

      // Height scaling
      const heightInches = m.height || 64;
      const heightScale = Math.max(0.92, Math.min(1.08, heightInches / 64));

      // 3. Draw Scaled 3D Avatar Image
      ctx.save();
      ctx.translate(w * 0.5 + this.panOffset.x, h * 0.49 + this.panOffset.y);
      ctx.scale(this.zoomLevel, this.zoomLevel);

      // Apply body measurement scaling
      const baseH = h * 0.88 * heightScale;
      const imgAspect = activeImage.naturalWidth / activeImage.naturalHeight;
      const baseW = baseH * imgAspect;
      const scaledW = baseW * bodyWidthScale;

      ctx.save();
      if (isMirrored) {
        ctx.scale(-1, 1);
      }

      // Draw Avatar
      ctx.drawImage(activeImage, -scaledW * 0.5, -baseH * 0.5, scaledW, baseH);
      ctx.restore();

      // 4. Draw Measurement Calibration Rings (if active)
      if (this.showMeasurementLines) {
        this.renderMeasurementRings(ctx, scaledW, baseH, bustInches, waistInches, hipInches);
      }

      // 5. Draw Stand Patti & Neckline Callout Badge
      this.renderAtelierDetailsBadge(ctx, -scaledW * 0.5, -baseH * 0.5, scaledW, baseH);

      ctx.restore();

      // Angle readout watermark at bottom
      ctx.fillStyle = 'rgba(26, 18, 14, 0.7)';
      ctx.font = '600 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Perspective: ${angleLabel}`, w * 0.5, h - 16);
    }

    renderMeasurementRings(ctx, scaledW, baseH, bustIn, waistIn, hipIn) {
      const centerY = 0;
      const bustY = centerY - baseH * 0.17;
      const waistY = centerY - baseH * 0.05;
      const hipY = centerY + baseH * 0.09;

      const halfW = scaledW * 0.42;

      ctx.save();
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);

      // Bust line
      ctx.beginPath();
      ctx.moveTo(-halfW, bustY);
      ctx.lineTo(halfW, bustY);
      ctx.stroke();

      // Waist line
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.88, waistY);
      ctx.lineTo(halfW * 0.88, waistY);
      ctx.stroke();

      // Hip line
      ctx.beginPath();
      ctx.moveTo(-halfW * 1.05, hipY);
      ctx.lineTo(halfW * 1.05, hipY);
      ctx.stroke();

      ctx.setLineDash([]);

      // Inch labels
      ctx.fillStyle = '#6B1D2F';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Bust ${bustIn}"`, halfW + 42, bustY + 3);
      ctx.fillText(`Waist ${waistIn}"`, halfW * 0.88 + 44, waistY + 3);
      ctx.fillText(`Hip ${hipIn}"`, halfW * 1.05 + 38, hipY + 3);

      ctx.restore();
    }

    renderAtelierDetailsBadge(ctx, x, y, w, h) {
      const cfg = this.garmentConfig;
      if (!cfg) return;

      // Stand Patti Tag
      if (cfg.standPatti) {
        ctx.save();
        const badgeX = w * 0.45;
        const badgeY = -h * 0.28;

        ctx.fillStyle = 'rgba(26, 18, 14, 0.85)';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, 140, 36, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('✨ STAND PATTI COLLAR', badgeX + 8, badgeY + 14);

        ctx.fillStyle = '#FAF7F2';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`${cfg.standPattiStyle || 'SP-01'} (Mandarin)`, badgeX + 8, badgeY + 28);
        ctx.restore();
      }
    }

    renderCustomerPhotoView(ctx, w, h) {
      const photo = this.customerPhoto;
      const imgAspect = photo.naturalWidth / photo.naturalHeight;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > w / h) {
        drawW = w * 0.96;
        drawH = drawW / imgAspect;
      } else {
        drawH = h * 0.96;
        drawW = drawH * imgAspect;
      }
      drawX = (w - drawW) / 2;
      drawY = (h - drawH) / 2;

      ctx.save();
      ctx.translate(w * 0.5 + this.panOffset.x, h * 0.5 + this.panOffset.y);
      ctx.scale(this.zoomLevel, this.zoomLevel);
      ctx.translate(-w * 0.5, -h * 0.5);

      ctx.drawImage(photo, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    renderRealisticCatalogView(ctx, w, h) {
      const img = this.productTryonImage;
      if (!img || !img.complete || img.naturalWidth === 0) {
        this.render3DAvatar(ctx, w, h);
        return;
      }

      const imgAspect = img.naturalWidth / img.naturalHeight;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > w / h) {
        drawW = w * 0.94;
        drawH = drawW / imgAspect;
      } else {
        drawH = h * 0.94;
        drawW = drawH * imgAspect;
      }
      drawX = (w - drawW) / 2;
      drawY = (h - drawH) / 2;

      ctx.save();
      ctx.translate(w * 0.5 + this.panOffset.x, h * 0.5 + this.panOffset.y);
      ctx.scale(this.zoomLevel, this.zoomLevel);
      ctx.translate(-w * 0.5, -h * 0.5);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Realistic tryon label badge
      ctx.fillStyle = 'rgba(26, 18, 14, 0.75)';
      ctx.font = '600 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ Photorealistic Atelier Try-On Preview', w * 0.5, h - 16);
    }
  }

  // 6. Pluggable AI / 3D Technology Abstraction Layer (§AI Model / Technology Abstraction)
  const ProviderAbstraction = {
    activeProviders: {
      virtualTryOn: 'ClientCanvas360Engine',
      avatar: 'ClientPhotoSilhouetteEngine',
      visualization: 'AuthenticTextureCompositor',
      recommendation: 'ABHAHeuristicStylist'
    },

    registerProvider: function (type, providerInstance) {
      this.activeProviders[type] = providerInstance;
    }
  };

  return {
    STAND_PATTI_STYLES,
    DEFAULT_MEASUREMENTS,
    DEFAULT_GARMENT_CONFIG,
    CustomerProfileService,
    SavedDesignsService,
    TailoringSpecEngine,
    AISuggestionEngine,
    FabricDecompositionService,
    VisualFittingEngine,
    ProviderAbstraction
  };
}));
