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


  // 6. Visual Fitting Engine — Photorealistic Customer Try-On & 360° Atelier Seam View
  class VisualFittingEngine {
    constructor(canvasElement, options = {}) {
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext('2d');
      this.options = options;
      this.viewMode = 'realistic'; // 'realistic' (primary) or '360_seam'
      this.useHdModel = false;
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
      this.tryonImageObj = null;
      this.fabricTexturePattern = null;
      this.fabricImageObj = null;
      this.history = [];
      this.initEventListeners();
    }

    initEventListeners() {
      if (!this.canvas) return;
      const c = this.canvas;

      c.addEventListener('mousedown', (e) => {
        if (this.viewMode !== '360_seam') return;
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartAngle = this.currentAngle;
        c.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging || this.viewMode !== '360_seam') return;
        const deltaX = e.clientX - this.dragStartX;
        let newAngle = (this.dragStartAngle + deltaX * 0.65) % 360;
        if (newAngle < 0) newAngle += 360;
        this.setAngle(newAngle);
      });

      window.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          c.style.cursor = this.viewMode === '360_seam' ? 'grab' : 'default';
        }
      });

      c.addEventListener('touchstart', (e) => {
        if (this.viewMode !== '360_seam') return;
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.dragStartX = e.touches[0].clientX;
          this.dragStartAngle = this.currentAngle;
        }
      }, { passive: true });

      c.addEventListener('touchmove', (e) => {
        if (!this.isDragging || e.touches.length !== 1 || this.viewMode !== '360_seam') return;
        const deltaX = e.touches[0].clientX - this.dragStartX;
        let newAngle = (this.dragStartAngle + deltaX * 0.75) % 360;
        if (newAngle < 0) newAngle += 360;
        this.setAngle(newAngle);
      }, { passive: true });

      c.addEventListener('touchend', () => {
        this.isDragging = false;
      });
    }

    setViewMode(mode) {
      this.viewMode = mode;
      if (this.canvas) {
        this.canvas.style.cursor = mode === '360_seam' ? 'grab' : 'default';
      }
      this.render();
      if (this.options.onModeChange) this.options.onModeChange(mode);
    }

    toggleHdModel() {
      this.useHdModel = !this.useHdModel;
      this.render();
      return this.useHdModel;
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

    loadData({ product, garmentConfig, measurements, photoUrl }) {
      this.product = product;
      if (garmentConfig) this.garmentConfig = { ...garmentConfig };
      if (measurements) this.measurements = { ...measurements };
      this.pushHistory();

      // Load Try-On HD Image
      if (product) {
        const tryonUrl = product.tryonImage || (product.fabricBreakdown && product.fabricBreakdown.tryonImage);
        if (tryonUrl) {
          const tImg = new Image();
          if (tryonUrl.startsWith('http')) tImg.crossOrigin = 'anonymous';
          tImg.onload = () => {
            this.tryonImageObj = tImg;
            this.render();
          };
          tImg.src = tryonUrl;
        }

        const fabricUrl = product.image || product.primary_image;
        if (fabricUrl) {
          const img = new Image();
          if (fabricUrl.startsWith('http')) img.crossOrigin = 'anonymous';
          img.onload = () => {
            this.fabricImageObj = img;
            try {
              this.fabricTexturePattern = this.ctx.createPattern(img, 'repeat');
            } catch (e) {
              console.warn('Pattern creation note:', e);
            }
            this.render();
          };
          img.src = fabricUrl;
        }
      }

      if (photoUrl) {
        const pImg = new Image();
        pImg.onload = () => {
          this.customerPhoto = pImg;
          this.useHdModel = false;
          this.render();
        };
        pImg.src = photoUrl;
      } else {
        this.customerPhoto = null;
        this.useHdModel = true;
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

      if (this.viewMode === '360_seam') {
        this.render360SeamView(ctx, w, h);
      } else {
        this.renderRealisticTryOn(ctx, w, h);
      }

      ctx.restore();
    }

    // =========================================================================
    // REALISTIC TRY-ON ENGINE (Customer Photo or HD Studio Model)
    // =========================================================================
    renderRealisticTryOn(ctx, w, h) {
      // 1. Luxury Boutique Background Backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#FAF8F5');
      grad.addColorStop(0.6, '#F3ECE4');
      grad.addColorStop(1, '#E8DFD3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Floor Shadow
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.94, w * 0.35, 16, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(26, 18, 14, 0.14)';
      ctx.fill();

      // Case A: User chose to view HD Studio Model OR has not uploaded customer photo yet
      if (this.useHdModel || !this.customerPhoto) {
        if (this.tryonImageObj && this.tryonImageObj.complete && this.tryonImageObj.naturalWidth > 0) {
          const img = this.tryonImageObj;
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const canvasAspect = w / h;
          let drawW, drawH, drawX, drawY;

          if (imgAspect > canvasAspect) {
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

          // Render high-fashion try-on image
          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          // Reactive Tailoring Annotations overlay
          this.renderReactiveOverlays(ctx, drawX, drawY, drawW, drawH);

          ctx.restore();
          return;
        }
      }

      // Case B: Customer uploaded photo — Real Body Adaptive Try-On
      if (this.customerPhoto && this.customerPhoto.complete && this.customerPhoto.naturalWidth > 0) {
        const photo = this.customerPhoto;
        const imgAspect = photo.naturalWidth / photo.naturalHeight;
        let drawW, drawH, drawX, drawY;

        if (imgAspect > w / h) {
          drawW = w;
          drawH = drawW / imgAspect;
        } else {
          drawH = h;
          drawW = drawH * imgAspect;
        }
        drawX = (w - drawW) / 2;
        drawY = (h - drawH) / 2;

        ctx.save();
        ctx.translate(w * 0.5 + this.panOffset.x, h * 0.5 + this.panOffset.y);
        ctx.scale(this.zoomLevel, this.zoomLevel);
        ctx.translate(-w * 0.5, -h * 0.5);

        // 1. Draw customer's ACTUAL photo with 100% fidelity (face, hair, smile, background preserved)
        ctx.drawImage(photo, drawX, drawY, drawW, drawH);

        // 2. Synthesize Tailored Garment onto Customer's Actual Body
        this.renderGarmentOnCustomerPhoto(ctx, drawX, drawY, drawW, drawH);

        ctx.restore();
      }
    }

    renderGarmentOnCustomerPhoto(ctx, x, y, w, h) {
      const config = this.garmentConfig;
      const m = this.measurements;
      const primaryColor = (this.product && this.product.color) ? this.getSuitColorHex(this.product.id) : '#B31B4D';

      // Estimate anatomical anchor coordinates on customer's body
      const centerX = x + w * 0.5;
      const neckY = y + h * 0.28;
      const bustY = y + h * 0.38;
      const waistY = y + h * 0.48;
      const hipY = y + h * 0.58;
      const kurtaEndY = y + h * 0.74;
      const pantsEndY = y + h * 0.90;

      const halfShoulder = w * 0.22;
      const halfBust = w * 0.20;
      const halfWaist = w * 0.17;
      let halfHip = w * 0.22;
      if (config.kurtaSilhouette === 'A-line') halfHip = w * 0.26;
      else if (config.kurtaSilhouette === 'Anarkali') halfHip = w * 0.32;

      // 1. Draw Stitched Straight Pants / Salwar on Lower Body
      ctx.save();
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      // Left leg
      ctx.moveTo(centerX - halfWaist * 0.7, hipY);
      ctx.lineTo(centerX - 4, hipY);
      ctx.lineTo(centerX - 8, pantsEndY);
      ctx.lineTo(centerX - halfWaist * 0.65, pantsEndY);
      ctx.closePath();
      ctx.fill();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(centerX + 4, hipY);
      ctx.lineTo(centerX + halfWaist * 0.7, hipY);
      ctx.lineTo(centerX + halfWaist * 0.65, pantsEndY);
      ctx.lineTo(centerX + 8, pantsEndY);
      ctx.closePath();
      ctx.fill();

      // Pant Hem Border (Gota / Leheriya coordinate)
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(centerX - halfWaist * 0.65, pantsEndY - 6, halfWaist * 0.6, 3);
      ctx.fillRect(centerX + 8, pantsEndY - 6, halfWaist * 0.6, 3);
      ctx.restore();

      // 2. Draw Stitched Kurta Silhouette over Torso
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX - halfShoulder, neckY);
      ctx.quadraticCurveTo(centerX - halfBust, bustY, centerX - halfWaist, waistY);
      ctx.quadraticCurveTo(centerX - halfHip * 0.9, hipY, centerX - halfHip, kurtaEndY);
      ctx.lineTo(centerX + halfHip, kurtaEndY);
      ctx.quadraticCurveTo(centerX + halfHip * 0.9, hipY, centerX + halfWaist, waistY);
      ctx.quadraticCurveTo(centerX + halfBust, bustY, centerX + halfShoulder, neckY);
      ctx.closePath();

      // Fabric texture or rich handloom color
      if (this.fabricTexturePattern) {
        ctx.fillStyle = this.fabricTexturePattern;
      } else {
        ctx.fillStyle = primaryColor;
      }
      ctx.fill();

      // Natural cloth lighting & fold depth via soft shading
      const drapeGrad = ctx.createLinearGradient(centerX - halfHip, 0, centerX + halfHip, 0);
      drapeGrad.addColorStop(0, 'rgba(0,0,0,0.22)');
      drapeGrad.addColorStop(0.2, 'rgba(255,255,255,0.12)');
      drapeGrad.addColorStop(0.5, 'rgba(0,0,0,0.02)');
      drapeGrad.addColorStop(0.8, 'rgba(255,255,255,0.1)');
      drapeGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = drapeGrad;
      ctx.fill();

      // Tailoring Side Slit indicator
      if (config.sideSlits) {
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(centerX + halfWaist * 0.95, waistY + (hipY - waistY) * 0.6);
        ctx.lineTo(centerX + halfHip, kurtaEndY);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Draw Tailored Sleeves along Arms
      this.renderAdaptiveSleeves(ctx, centerX, neckY, bustY, halfShoulder, config.sleeveLength, primaryColor);

      // 4. Draw Neckline & Structured Stand Patti Collar directly on customer's neck
      this.renderAdaptiveNeckline(ctx, centerX, neckY, halfShoulder, config);

      // 5. Draw Elegant Translucent Dupatta Drape on One Shoulder
      this.renderAdaptiveDupatta(ctx, centerX, neckY, halfShoulder, kurtaEndY, primaryColor);
    }

    renderAdaptiveSleeves(ctx, centerX, neckY, bustY, halfShoulder, sleeveLength, color) {
      if (sleeveLength === 'Sleeveless') return;
      ctx.save();
      ctx.fillStyle = this.fabricTexturePattern || color;

      let sleeveEndY = bustY;
      if (sleeveLength === 'Short') sleeveEndY = neckY + (bustY - neckY) * 0.9;
      else if (sleeveLength === '3/4') sleeveEndY = bustY + (bustY - neckY) * 1.1;
      else if (sleeveLength === 'Full') sleeveEndY = bustY + (bustY - neckY) * 2.2;

      // Left arm sleeve
      ctx.beginPath();
      ctx.moveTo(centerX - halfShoulder, neckY);
      ctx.lineTo(centerX - halfShoulder - 24, neckY + 12);
      ctx.lineTo(centerX - halfShoulder - 16, sleeveEndY);
      ctx.lineTo(centerX - halfShoulder + 10, sleeveEndY - 6);
      ctx.closePath();
      ctx.fill();

      // Right arm sleeve
      ctx.beginPath();
      ctx.moveTo(centerX + halfShoulder, neckY);
      ctx.lineTo(centerX + halfShoulder + 24, neckY + 12);
      ctx.lineTo(centerX + halfShoulder + 16, sleeveEndY);
      ctx.lineTo(centerX + halfShoulder - 10, sleeveEndY - 6);
      ctx.closePath();
      ctx.fill();

      // Zari hem piping on sleeve cuffs
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(centerX - halfShoulder - 16, sleeveEndY - 3, 26, 2.5);
      ctx.fillRect(centerX + halfShoulder - 10, sleeveEndY - 3, 26, 2.5);
      ctx.restore();
    }

    renderAdaptiveNeckline(ctx, centerX, neckY, halfShoulder, config) {
      ctx.save();
      const neckWidth = halfShoulder * 0.38;
      let neckDepth = 32;
      if (config.neckDepth === 'Deep') neckDepth = 46;

      // Draw Neck Cutout to preserve customer's real skin
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(centerX - neckWidth, neckY);
      if (config.neckDesign === 'V-neck') {
        ctx.lineTo(centerX, neckY + neckDepth);
        ctx.lineTo(centerX + neckWidth, neckY);
      } else if (config.neckDesign === 'Square') {
        ctx.lineTo(centerX - neckWidth, neckY + neckDepth);
        ctx.lineTo(centerX + neckWidth, neckY + neckDepth);
        ctx.lineTo(centerX + neckWidth, neckY);
      } else {
        ctx.quadraticCurveTo(centerX, neckY + neckDepth * 1.3, centerX + neckWidth, neckY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Neckline Zari Piping / Gota Patti Border
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(centerX - neckWidth, neckY);
      if (config.neckDesign === 'V-neck') {
        ctx.lineTo(centerX, neckY + neckDepth);
        ctx.lineTo(centerX + neckWidth, neckY);
      } else {
        ctx.quadraticCurveTo(centerX, neckY + neckDepth * 1.3, centerX + neckWidth, neckY);
      }
      ctx.stroke();

      // Stand Patti (Mandarin Collar) Presets (SP-01 to SP-04)
      if (config.standPatti) {
        const styleId = config.standPattiStyle || 'SP-01';
        ctx.save();
        ctx.fillStyle = this.fabricTexturePattern || '#851A38';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.0;

        // Structured Collar Band around neck
        ctx.beginPath();
        ctx.moveTo(centerX - neckWidth - 4, neckY);
        ctx.lineTo(centerX - neckWidth - 2, neckY - 18);
        ctx.quadraticCurveTo(centerX, neckY - 24, centerX + neckWidth + 2, neckY - 18);
        ctx.lineTo(centerX + neckWidth + 4, neckY);
        ctx.lineTo(centerX + neckWidth - 3, neckY);
        ctx.quadraticCurveTo(centerX, neckY - 10, centerX - neckWidth + 3, neckY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Placket with Potli Buttons / Threadwork
        const placketH = styleId === 'SP-02' ? 65 : 50;
        ctx.fillStyle = '#FFF9F0';
        ctx.fillRect(centerX - 4.5, neckY + 12, 9, placketH);
        ctx.strokeRect(centerX - 4.5, neckY + 12, 9, placketH);

        // Potli Buttons
        ctx.fillStyle = '#851A38';
        for (let by = neckY + 22; by < neckY + 12 + placketH - 6; by += 12) {
          ctx.beginPath();
          ctx.arc(centerX, by, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();
    }

    renderAdaptiveDupatta(ctx, centerX, neckY, halfShoulder, kurtaEndY, color) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = color;

      // Soft shoulder drape over left side
      ctx.beginPath();
      ctx.moveTo(centerX - halfShoulder - 6, neckY - 6);
      ctx.quadraticCurveTo(centerX - halfShoulder - 30, neckY + 60, centerX - halfShoulder - 26, kurtaEndY + 30);
      ctx.lineTo(centerX - halfShoulder - 2, kurtaEndY + 30);
      ctx.quadraticCurveTo(centerX - halfShoulder - 8, neckY + 60, centerX - halfShoulder + 12, neckY + 10);
      ctx.closePath();
      ctx.fill();

      // Zari border trim on dupatta edge
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.0;
      ctx.stroke();
      ctx.restore();
    }

    renderReactiveOverlays(ctx, x, y, w, h) {
      // Dynamic live tag showing Stand Patti status
      if (this.garmentConfig.standPatti) {
        ctx.save();
        ctx.fillStyle = 'rgba(26, 18, 14, 0.85)';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1;
        const tagX = x + w * 0.55;
        const tagY = y + h * 0.18;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, 130, 26, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FAF7F2';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`✨ Stand Patti: ${this.garmentConfig.standPattiStyle || 'SP-01'}`, tagX + 8, tagY + 16);
        ctx.restore();
      }
    }

    getSuitColorHex(prodId) {
      switch (prodId) {
        case 'prod-01': return '#B31B4D'; // Rani Pink
        case 'prod-02': return '#D98200'; // Mustard Yellow
        case 'prod-03': return '#6A1039'; // Magenta Wine
        case 'prod-04': return '#E6DFCE'; // Cream
        case 'prod-05': return '#125B66'; // Teal
        default: return '#B31B4D';
      }
    }

    // =========================================================================
    // TECHNICAL 360° ATELIER SEAM VIEW (For rotating to inspect back seams & darts)
    // =========================================================================
    render360SeamView(ctx, w, h) {
      // Warm Ivory Studio
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.35, 30, w * 0.5, h * 0.5, h * 0.65);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.65, '#FAF7F2');
      grad.addColorStop(1, '#EDE7DF');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.94, w * 0.3, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(26, 26, 26, 0.12)';
      ctx.fill();

      ctx.translate(w * 0.5 + this.panOffset.x, h * 0.48 + this.panOffset.y);
      ctx.scale(this.zoomLevel, this.zoomLevel);

      const rad = (this.currentAngle * Math.PI) / 180;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);
      const isBackView = this.currentAngle > 90 && this.currentAngle < 270;
      const perspectiveSkew = Math.abs(cosA);

      // Draw Anatomical Model
      this.drawAvatarBase(ctx, cosA, sinA, isBackView, perspectiveSkew);
      this.drawBottomGarment(ctx, cosA, sinA, isBackView, perspectiveSkew);
      this.drawKurtaGarment(ctx, cosA, sinA, isBackView, perspectiveSkew);
      this.drawFabricLighting(ctx, cosA, isBackView);
    }

    drawAvatarBase(ctx, cosA, sinA, isBackView, perspectiveSkew) {
      ctx.save();
      const headY = -230;
      const headRadius = 24;

      ctx.fillStyle = '#D4A88E';
      ctx.beginPath();
      ctx.rect(-10 * perspectiveSkew, headY + 18, 20 * perspectiveSkew, 35);
      ctx.fill();

      ctx.fillStyle = isBackView ? '#3B2A22' : '#EACBB5';
      ctx.beginPath();
      ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2A1B14';
      ctx.beginPath();
      ctx.arc(0, headY - 14, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawBottomGarment(ctx, cosA, sinA, isBackView, perspectiveSkew) {
      ctx.save();
      const bottomType = this.garmentConfig.bottomType || 'Straight Pants';
      const startY = 40;
      const endY = 240;
      const primaryColor = (this.product && this.product.color) ? this.getSuitColorHex(this.product.id) : '#5C1D24';

      ctx.fillStyle = this.fabricTexturePattern || primaryColor;
      ctx.beginPath();
      ctx.moveTo(-24 * perspectiveSkew, startY);
      ctx.lineTo(24 * perspectiveSkew, startY);
      ctx.lineTo(18 * perspectiveSkew, endY);
      ctx.lineTo(7 * perspectiveSkew, endY);
      ctx.lineTo(0, startY + 50);
      ctx.lineTo(-7 * perspectiveSkew, endY);
      ctx.lineTo(-18 * perspectiveSkew, endY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    drawKurtaGarment(ctx, cosA, sinA, isBackView, perspectiveSkew) {
      ctx.save();
      const config = this.garmentConfig;
      const measurements = this.measurements;
      const primaryColor = (this.product && this.product.color) ? this.getSuitColorHex(this.product.id) : '#B31B4D';

      ctx.fillStyle = this.fabricTexturePattern || primaryColor;

      const bustWidth = (measurements.bust ? (measurements.bust / 36) * 38 : 38) * Math.max(0.35, perspectiveSkew);
      const waistWidth = (measurements.waist ? (measurements.waist / 32) * 32 : 32) * Math.max(0.35, perspectiveSkew);
      const hipWidth = (measurements.hip ? (measurements.hip / 38) * 44 : 44) * Math.max(0.35, perspectiveSkew);

      let bottomFlare = 0;
      if (config.kurtaSilhouette === 'A-line') bottomFlare = 20 * perspectiveSkew;
      else if (config.kurtaSilhouette === 'Anarkali') bottomFlare = 45 * perspectiveSkew;

      const baseLength = measurements.kurtaLength || config.kurtaLengthInches || 42;
      const kurtaBottomY = 20 + (baseLength - 40) * 4.5;

      ctx.beginPath();
      ctx.moveTo(-bustWidth, -170);
      ctx.lineTo(bustWidth, -170);
      ctx.quadraticCurveTo(bustWidth + 4, -80, waistWidth, -40);
      ctx.quadraticCurveTo(hipWidth + 5, 20, hipWidth + bottomFlare, kurtaBottomY);
      ctx.lineTo(-hipWidth - bottomFlare, kurtaBottomY);
      ctx.quadraticCurveTo(-hipWidth - 5, 20, -waistWidth, -40);
      ctx.quadraticCurveTo(-bustWidth - 4, -80, -bustWidth, -170);
      ctx.closePath();
      ctx.fill();

      // Tailor back darts / seams indicator
      if (isBackView) {
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(-waistWidth * 0.4, -130);
        ctx.lineTo(-waistWidth * 0.4, 0);
        ctx.moveTo(waistWidth * 0.4, -130);
        ctx.lineTo(waistWidth * 0.4, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    drawFabricLighting(ctx, cosA, isBackView) {
      ctx.save();
      const shadowGradient = ctx.createLinearGradient(-100, 0, 100, 0);
      shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
      shadowGradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.08)');
      shadowGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.0)');
      shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

      ctx.fillStyle = shadowGradient;
      ctx.fillRect(-150, -180, 300, 440);
      ctx.restore();
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
