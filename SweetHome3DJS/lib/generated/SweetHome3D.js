var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/*
 * DO NOT MODIFY: this source code has been automatically generated from Java
 *                with JSweet (http://www.jsweet.org)
 *
 * Sweet Home 3D, Copyright (c) 2017 Emmanuel PUYBARET / eTeks <info@eteks.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */
/**
 * SAX handler for Sweet Home 3D XML stream. Read home should respect the following DTD:<pre>
 * &lt;!ELEMENT home (property*, furnitureVisibleProperty*, environment?, backgroundImage?, print?, compass?, (camera | observerCamera)*, level*,
 * (pieceOfFurniture | doorOrWindow | furnitureGroup | light)*, wall*, room*, polyline*, dimensionLine*, label*)>
 * &lt;!ATTLIST home
 * version CDATA #IMPLIED
 * name CDATA #IMPLIED
 * camera (observerCamera | topCamera) "topCamera"
 * selectedLevel CDATA #IMPLIED
 * wallHeight CDATA #IMPLIED
 * basePlanLocked (false | true) "false"
 * furnitureSortedProperty CDATA #IMPLIED
 * furnitureDescendingSorted (false | true) "false">
 *
 * &lt;!ELEMENT property EMPTY>
 * &lt;!ATTLIST property
 * name CDATA #REQUIRED
 * value CDATA #REQUIRED>
 *
 * &lt;!ELEMENT furnitureVisibleProperty EMPTY>
 * &lt;!ATTLIST furnitureVisibleProperty name CDATA #REQUIRED>
 *
 * &lt;!ELEMENT environment ((camera | observerCamera)*, texture?, texture?) >
 * &lt;!ATTLIST environment
 * groundColor CDATA #IMPLIED
 * skyColor CDATA #IMPLIED
 * lightColor CDATA #IMPLIED
 * wallsAlpha CDATA "0"
 * allLevelsVisible (false | true) "false"
 * observerCameraElevationAdjusted (false | true) "true"
 * ceillingLightColor CDATA #IMPLIED
 * drawingMode (FILL | OUTLINE | FILL_AND_OUTLINE) "FILL"
 * subpartSizeUnderLight CDATA "0"
 * photoWidth CDATA "400"
 * photoHeight CDATA "300"
 * photoAspectRatio (FREE_RATIO | VIEW_3D_RATIO | RATIO_4_3 | RATIO_3_2 | RATIO_16_9 | RATIO_2_1 | SQUARE_RATIO) "VIEW_3D_RATIO"
 * photoQuality CDATA "0"
 * videoWidth CDATA "320"
 * videoAspectRatio (RATIO_4_3 | RATIO_16_9) "RATIO_4_3"
 * videoQuality CDATA "0"
 * videoFrameRate CDATA "25">
 *
 * &lt;!ELEMENT backgroundImage EMPTY>
 * &lt;!ATTLIST backgroundImage
 * image CDATA #REQUIRED
 * scaleDistance CDATA #REQUIRED
 * scaleDistanceXStart CDATA #REQUIRED
 * scaleDistanceYStart CDATA #REQUIRED
 * scaleDistanceXEnd CDATA #REQUIRED
 * scaleDistanceYEnd CDATA #REQUIRED
 * xOrigin CDATA "0"
 * yOrigin CDATA "0"
 * visible (false | true) "true">
 *
 * &lt;!ELEMENT print EMPTY>
 * &lt;!ATTLIST print
 * headerFormat CDATA #IMPLIED
 * footerFormat CDATA #IMPLIED
 * planScale CDATA #IMPLIED
 * furniturePrinted (false | true) "true"
 * planPrinted (false | true) "true"
 * view3DPrinted (false | true) "true"
 * paperWidth CDATA #REQUIRED
 * paperHeight CDATA #REQUIRED
 * paperTopMargin CDATA #REQUIRED
 * paperLeftMargin CDATA #REQUIRED
 * paperBottomMargin CDATA #REQUIRED
 * paperRightMargin CDATA #REQUIRED
 * paperOrientation (PORTRAIT | LANDSCAPE | REVERSE_LANDSCAPE) #REQUIRED>
 *
 * &lt;!ELEMENT compass (property*)>
 * &lt;!ATTLIST compass
 * x CDATA #REQUIRED
 * y CDATA #REQUIRED
 * diameter CDATA #REQUIRED
 * northDirection CDATA "0"
 * longitude CDATA #IMPLIED
 * latitude CDATA #IMPLIED
 * timeZone CDATA #IMPLIED
 * visible (false | true) "true">
 *
 * &lt;!ENTITY % cameraCommonAttributes
 * 'name CDATA #IMPLIED
 * lens (PINHOLE | NORMAL | FISHEYE | SPHERICAL) "PINHOLE"
 * x CDATA #REQUIRED
 * y CDATA #REQUIRED
 * z CDATA #REQUIRED
 * yaw CDATA #REQUIRED
 * pitch CDATA #REQUIRED
 * time CDATA #IMPLIED
 * fieldOfView CDATA #REQUIRED'>
 *
 * &lt;!ELEMENT camera (property*)>
 * &lt;!ATTLIST camera
 * %cameraCommonAttributes;
 * attribute (topCamera | storedCamera | cameraPath) #REQUIRED>
 *
 * &lt;!ELEMENT observerCamera (property*)>
 * &lt;!ATTLIST observerCamera
 * %cameraCommonAttributes;
 * attribute (observerCamera | storedCamera | cameraPath) #REQUIRED
 * fixedSize (false | true) "false">
 *
 * &lt;!ELEMENT level (property*, backgroundImage?)>
 * &lt;!ATTLIST level
 * id ID #REQUIRED
 * name CDATA #REQUIRED
 * elevation CDATA #REQUIRED
 * floorThickness CDATA #REQUIRED
 * height CDATA #REQUIRED
 * elevationIndex CDATA "-1"
 * visible (false | true) "true"
 * viewable (false | true) "true">
 *
 * &lt;!ENTITY % furnitureCommonAttributes
 * 'name CDATA #REQUIRED
 * angle CDATA "0"
 * visible (false | true) "true"
 * movable (false | true) "true"
 * description CDATA #IMPLIED
 * modelMirrored (false | true) "false"
 * nameVisible (false | true) "false"
 * nameAngle CDATA "0"
 * nameXOffset CDATA "0"
 * nameYOffset CDATA "0"
 * price CDATA #IMPLIED'>
 *
 * &lt;!ELEMENT furnitureGroup ((pieceOfFurniture | doorOrWindow | furnitureGroup | light)*, property*, textStyle?)>
 * &lt;!ATTLIST furnitureGroup
 * %furnitureCommonAttributes;
 * level IDREF #IMPLIED
 * x CDATA #IMPLIED
 * y CDATA #IMPLIED
 * elevation CDATA #IMPLIED
 * width CDATA #IMPLIED
 * depth CDATA #IMPLIED
 * height CDATA #IMPLIED
 * dropOnTopElevation CDATA #IMPLIED>
 *
 * &lt;!ENTITY % pieceOfFurnitureCommonAttributes
 * 'level IDREF #IMPLIED
 * catalogId CDATA #IMPLIED
 * x CDATA #REQUIRED
 * y CDATA #REQUIRED
 * elevation CDATA "0"
 * width CDATA #REQUIRED
 * depth CDATA #REQUIRED
 * height CDATA #REQUIRED
 * dropOnTopElevation CDATA "1"
 * information CDATA #IMPLIED
 * model CDATA #IMPLIED
 * icon CDATA #IMPLIED
 * planIcon CDATA #IMPLIED
 * modelRotation CDATA "1 0 0 0 1 0 0 0 1"
 * backFaceShown (false | true) "false"
 * doorOrWindow (false | true) "false"
 * resizable (false | true) "true"
 * deformable (false | true) "true"
 * texturable (false | true) "true"
 * staircaseCutOutShape CDATA #IMPLIED
 * color CDATA #IMPLIED
 * shininess CDATA #IMPLIED
 * creator CDATA #IMPLIED
 * valueAddedTaxPercentage CDATA #IMPLIED
 * currency CDATA #IMPLIED'>
 *
 * &lt;!ELEMENT pieceOfFurniture (property*, textStyle?, texture?, material*)>
 * &lt;!ATTLIST pieceOfFurniture
 * %furnitureCommonAttributes;
 * %pieceOfFurnitureCommonAttributes;>
 *
 * &lt;!ELEMENT doorOrWindow (sash*, property*, textStyle?, texture?, material*)>
 * &lt;!ATTLIST doorOrWindow
 * %furnitureCommonAttributes;
 * %pieceOfFurnitureCommonAttributes;
 * wallThickness CDATA "1"
 * wallDistance CDATA "0"
 * cutOutShape CDATA #IMPLIED
 * boundToWall (false | true) "true">
 *
 * &lt;!ELEMENT sash EMPTY>
 * &lt;!ATTLIST sash
 * xAxis CDATA #REQUIRED
 * yAxis CDATA #REQUIRED
 * width CDATA #REQUIRED
 * startAngle CDATA #REQUIRED
 * endAngle CDATA #REQUIRED>
 *
 * &lt;!ELEMENT light (lightSource*, property*, textStyle?, texture?, material*)>
 * &lt;!ATTLIST light
 * %furnitureCommonAttributes;
 * %pieceOfFurnitureCommonAttributes;
 * power CDATA "0.5">
 *
 * &lt;!ELEMENT lightSource EMPTY>
 * &lt;!ATTLIST lightSource
 * x CDATA #REQUIRED
 * y CDATA #REQUIRED
 * z CDATA #REQUIRED
 * color CDATA #REQUIRED
 * diameter CDATA #IMPLIED>
 *
 * &lt;!ELEMENT textStyle EMPTY>
 * &lt;!ATTLIST textStyle
 * attribute (nameStyle | areaStyle | lengthStyle) #IMPLIED
 * fontName CDATA #IMPLIED
 * fontSize CDATA #REQUIRED
 * bold (false | true) "false"
 * italic (false | true) "false">
 *
 * &lt;!ELEMENT texture EMPTY>
 * &lt;!ATTLIST texture
 * attribute (groundTexture | skyTexture | leftSideTexture | rightSideTexture | floorTexture | ceilingTexture) #IMPLIED
 * catalogId CDATA #IMPLIED
 * name CDATA #REQUIRED
 * width CDATA #REQUIRED
 * height CDATA #REQUIRED
 * angle CDATA "0"
 * leftToRightOriented (true | false) "true"
 * image CDATA #REQUIRED>
 *
 * &lt;!ELEMENT material (texture?)>
 * &lt;!ATTLIST material
 * name CDATA #REQUIRED
 * key CDATA #IMPLIED
 * color CDATA #IMPLIED
 * shininess CDATA #IMPLIED>
 *
 * &lt;!ELEMENT wall (property*, texture?, texture?, baseboard?, baseboard?)>
 * &lt;!ATTLIST wall
 * id ID #REQUIRED
 * level IDREF #IMPLIED
 * wallAtStart IDREF #IMPLIED
 * wallAtEnd IDREF #IMPLIED
 * xStart CDATA #REQUIRED
 * yStart CDATA #REQUIRED
 * xEnd CDATA #REQUIRED
 * yEnd CDATA #REQUIRED
 * height CDATA #IMPLIED
 * heightAtEnd CDATA #IMPLIED
 * thickness CDATA #REQUIRED
 * arcExtent CDATA #IMPLIED
 * pattern CDATA #IMPLIED
 * topColor CDATA #IMPLIED
 * leftSideColor CDATA #IMPLIED
 * leftSideShininess CDATA "0"
 * rightSideColor CDATA #IMPLIED
 * rightSideShininess CDATA "0">
 *
 * &lt;!ELEMENT baseboard (texture?)>
 * &lt;!ATTLIST baseboard
 * attribute (leftSideBaseboard | rightSideBaseboard) #REQUIRED
 * thickness CDATA #REQUIRED
 * height CDATA #REQUIRED
 * color CDATA #IMPLIED>
 *
 * &lt;!ELEMENT room (property*, textStyle?, textStyle?, texture?, texture?, point+)>
 * &lt;!ATTLIST room
 * level IDREF #IMPLIED
 * name CDATA #IMPLIED
 * nameAngle CDATA "0"
 * nameXOffset CDATA "0"
 * nameYOffset CDATA "-40"
 * areaVisible (false | true) "false"
 * areaAngle CDATA "0"
 * areaXOffset CDATA "0"
 * areaYOffset CDATA "0"
 * floorVisible (false | true) "true"
 * floorColor CDATA #IMPLIED
 * floorShininess CDATA "0"
 * ceilingVisible (false | true) "true"
 * ceilingColor CDATA #IMPLIED
 * ceilingShininess CDATA "0">
 *
 * &lt;!ELEMENT point EMPTY>
 * &lt;!ATTLIST point
 * x CDATA #REQUIRED
 * y CDATA #REQUIRED>
 *
 * &lt;!ELEMENT polyline (property*, point+)>
 * &lt;!ATTLIST polyline
 * level IDREF #IMPLIED
 * thickness CDATA "1"
 * capStyle (BUTT | SQUARE | ROUND) "BUTT"
 * joinStyle (BEVEL | MITER | ROUND | CURVED) "MITER"
 * dashStyle (SOLID | DOT | DASH | DASH_DOT | DASH_DOT_DOT) "SOLID"
 * startArrowStyle (NONE | DELTA | OPEN | DISC) "NONE"
 * endArrowStyle (NONE | DELTA | OPEN | DISC) "NONE"
 * color CDATA #IMPLIED
 * closedPath (false | true) "false">
 *
 * &lt;!ELEMENT dimensionLine (property*, textStyle?)>
 * &lt;!ATTLIST dimensionLine
 * level IDREF #IMPLIED
 * xStart CDATA #REQUIRED
 * yStart CDATA #REQUIRED
 * xEnd CDATA #REQUIRED
 * yEnd CDATA #REQUIRED
 * offset CDATA #REQUIRED>
 *
 * &lt;!ELEMENT label (property*, textStyle?, text)>
 * &lt;!ATTLIST label
 * level IDREF #IMPLIED
 * x CDATA #REQUIRED
 * y CDATA #REQUIRED
 * angle CDATA "0"
 * elevation CDATA "0"
 * pitch CDATA #IMPLIED
 * color CDATA #IMPLIED
 * outlineColor CDATA #IMPLIED>
 *
 * &lt;!ELEMENT text (#PCDATA)>
 * </pre>
 * with <code>home</code> as root element.
 * Attributes named <code>attribute</code> indicate the names of the object fields
 * where some elements should be stored.
 * @author Emmanuel Puybaret
 * @extends DefaultHandler
 */
var HomeXMLHandler = (function (_super) {
    __extends(HomeXMLHandler, _super);
    function HomeXMLHandler(preferences) {
        var _this = this;
        if (((preferences != null && preferences instanceof UserPreferences) || preferences === null)) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this) || this;
            _this.preferences = null;
            _this.home = null;
            _this.homeElementName = null;
            _this.labelText = null;
            _this.leftSideBaseboard = null;
            _this.rightSideBaseboard = null;
            _this.homeBackgroundImage = null;
            _this.backgroundImage = null;
            _this.materialTexture = null;
            _this.buffer = { str: "", toString: function () { return this.str; } };
            _this.elements = ([]);
            _this.attributes = ([]);
            _this.groupsFurniture = ([]);
            _this.levels = ({});
            _this.joinedWalls = ({});
            _this.homeProperties = ({});
            _this.properties = ({});
            _this.textStyles = ({});
            _this.textures = ({});
            _this.materials = ([]);
            _this.sashes = ([]);
            _this.lightSources = ([]);
            _this.points = ([]);
            _this.furnitureVisibleProperties = ([]);
            _this.preferences = null;
            _this.home = null;
            _this.homeElementName = null;
            _this.labelText = null;
            _this.leftSideBaseboard = null;
            _this.rightSideBaseboard = null;
            _this.homeBackgroundImage = null;
            _this.backgroundImage = null;
            _this.materialTexture = null;
            (function () {
                _this.preferences = preferences != null ? preferences : new UserPreferences();
            })();
        }
        else if (preferences === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_1 = Array.prototype.slice.call(arguments);
                var preferences_1 = null;
                _this = _super.call(this) || this;
                _this.preferences = null;
                _this.home = null;
                _this.homeElementName = null;
                _this.labelText = null;
                _this.leftSideBaseboard = null;
                _this.rightSideBaseboard = null;
                _this.homeBackgroundImage = null;
                _this.backgroundImage = null;
                _this.materialTexture = null;
                _this.buffer = { str: "", toString: function () { return this.str; } };
                _this.elements = ([]);
                _this.attributes = ([]);
                _this.groupsFurniture = ([]);
                _this.levels = ({});
                _this.joinedWalls = ({});
                _this.homeProperties = ({});
                _this.properties = ({});
                _this.textStyles = ({});
                _this.textures = ({});
                _this.materials = ([]);
                _this.sashes = ([]);
                _this.lightSources = ([]);
                _this.points = ([]);
                _this.furnitureVisibleProperties = ([]);
                _this.preferences = null;
                _this.home = null;
                _this.homeElementName = null;
                _this.labelText = null;
                _this.leftSideBaseboard = null;
                _this.rightSideBaseboard = null;
                _this.homeBackgroundImage = null;
                _this.backgroundImage = null;
                _this.materialTexture = null;
                (function () {
                    _this.preferences = preferences_1 != null ? preferences_1 : new UserPreferences();
                })();
            }
        }
        else
            throw new Error('invalid overload');
        return _this;
    }
    HomeXMLHandler.prototype.startDocument = function () {
        this.home = null;
        /* clear */ (this.elements.length = 0);
        /* clear */ (this.attributes.length = 0);
        /* clear */ (this.groupsFurniture.length = 0);
        /* clear */ (function (obj) { for (var member in obj)
            delete obj[member]; })(this.levels);
        /* clear */ (function (obj) { for (var member in obj)
            delete obj[member]; })(this.joinedWalls);
    };
    HomeXMLHandler.prototype.startElement = function (uri, localName, name, attributes) {
        /* setLength */ (function (sb, length) { return sb.str = sb.str.substring(0, length); })(this.buffer, 0);
        /* push */ this.elements.push(name);
        var attributesMap = ({});
        for (var i = 0; i < attributes.getLength(); i++) {
            /* put */ (attributesMap[attributes.getQName(i)] = attributes.getValue(i));
        }
        /* push */ this.attributes.push(attributesMap);
        if (("home" === name)) {
            this.setHome(this.createHome(attributesMap));
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.homeProperties);
            /* clear */ (this.furnitureVisibleProperties.length = 0);
            this.homeBackgroundImage = null;
        }
        else if (("environment" === name)) {
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.textures);
        }
        else if (("compass" === name)) {
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.properties);
        }
        else if (("level" === name)) {
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.properties);
            this.backgroundImage = null;
        }
        else if (("pieceOfFurniture" === name) || ("doorOrWindow" === name) || ("light" === name) || ("furnitureGroup" === name)) {
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.properties);
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.textStyles);
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.textures);
            /* clear */ (this.materials.length = 0);
            /* clear */ (this.sashes.length = 0);
            /* clear */ (this.lightSources.length = 0);
            if (("furnitureGroup" === name)) {
                /* push */ this.groupsFurniture.push([]);
            }
        }
        else if (("camera" === name) || ("observerCamera" === name)) {
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.properties);
        }
        else if (("room" === name)) {
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.properties);
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.textStyles);
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.textures);
            /* clear */ (this.points.length = 0);
        }
        else if (("polyline" === name)) {
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.properties);
            /* clear */ (this.points.length = 0);
        }
        else if (("dimensionLine" === name)) {
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.properties);
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.textStyles);
        }
        else if (("label" === name)) {
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.properties);
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.textStyles);
            this.labelText = null;
        }
        else if (("wall" === name)) {
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.properties);
            /* clear */ (function (obj) { for (var member in obj)
                delete obj[member]; })(this.textures);
            this.leftSideBaseboard = null;
            this.rightSideBaseboard = null;
        }
        else if (("baseboard" === name)) {
            /* remove */ delete this.textures[HomeXMLHandler.UNIQUE_ATTRIBUTE];
        }
        else if (("material" === name)) {
            this.materialTexture = null;
        }
    };
    HomeXMLHandler.prototype.characters = function (ch, start, length) {
        /* append */ (function (sb) { return sb.str = sb.str.concat(ch.substr(start, length)); })(this.buffer);
    };
    HomeXMLHandler.prototype.endElement = function (uri, localName, name) {
        /* pop */ this.elements.pop();
        var parent = (this.elements.length == 0) ? null : (function (s) { return s[s.length - 1]; })(this.elements);
        var attributesMap = this.attributes.pop();
        if (this.homeElementName != null && (this.homeElementName === name)) {
            this.setHomeAttributes(this.home, name, attributesMap);
        }
        else if (("furnitureVisibleProperty" === name)) {
            try {
                if ((function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "name") == null) {
                    throw new SAXException("Missing name attribute");
                }
                /* add */ this.furnitureVisibleProperties.push(/* valueOf */ /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "name"));
            }
            catch (ex) {
            }
            ;
        }
        else if (("environment" === name)) {
            this.setEnvironmentAttributes(this.home.getEnvironment(), name, attributesMap);
        }
        else if (("compass" === name)) {
            this.setCompassAttributes(this.home.getCompass(), name, attributesMap);
        }
        else if (("print" === name)) {
            this.home.setPrint(this.createPrint(attributesMap));
        }
        else if (("level" === name)) {
            var level = this.createLevel(attributesMap);
            this.setLevelAttributes(level, name, attributesMap);
            /* put */ (this.levels[(function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "id")] = level);
            this.home.addLevel(level);
        }
        else if (("camera" === name) || ("observerCamera" === name)) {
            var camera = this.createCamera(name, attributesMap);
            this.setCameraAttributes(camera, name, attributesMap);
            var attribute = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "attribute");
            if (("cameraPath" === attribute)) {
                var cameraPath = (this.home.getEnvironment().getVideoCameraPath().slice(0));
                /* add */ cameraPath.push(camera);
                this.home.getEnvironment().setVideoCameraPath(cameraPath);
            }
            else if (("topCamera" === attribute)) {
                var topCamera = this.home.getTopCamera();
                topCamera.setCamera(camera);
                topCamera.setTime(camera.getTime());
                topCamera.setLens(camera.getLens());
            }
            else if (("observerCamera" === attribute)) {
                var observerCamera = this.home.getObserverCamera();
                observerCamera.setCamera(camera);
                observerCamera.setTime(camera.getTime());
                observerCamera.setLens(camera.getLens());
                observerCamera.setFixedSize(camera.isFixedSize());
            }
            else if (("storedCamera" === attribute)) {
                var storedCameras = (this.home.getStoredCameras().slice(0));
                /* add */ storedCameras.push(camera);
                this.home.setStoredCameras(storedCameras);
            }
        }
        else if (("pieceOfFurniture" === name) || ("doorOrWindow" === name) || ("light" === name) || ("furnitureGroup" === name)) {
            var piece = ("furnitureGroup" === name) ? this.createFurnitureGroup(attributesMap, /* pop */ this.groupsFurniture.pop()) : this.createPieceOfFurniture(name, attributesMap);
            this.setPieceOfFurnitureAttributes(piece, name, attributesMap);
            if (this.homeElementName != null && (this.homeElementName === parent)) {
                this.home.addPieceOfFurniture$com_eteks_sweethome3d_model_HomePieceOfFurniture(piece);
                var levelId = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "level");
                if (levelId != null) {
                    piece.setLevel(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.levels, levelId));
                }
            }
            else if (("furnitureGroup" === parent)) {
                /* add */ /* peek */ (function (s) { return s[s.length - 1]; })(this.groupsFurniture).push(piece);
                /* clear */ (function (obj) { for (var member in obj)
                    delete obj[member]; })(this.properties);
                /* clear */ (function (obj) { for (var member in obj)
                    delete obj[member]; })(this.textStyles);
            }
        }
        else if (("wall" === name)) {
            var wall = this.createWall(attributesMap);
            /* put */ (this.joinedWalls[(function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "id")] = new HomeXMLHandler.JoinedWall(wall, /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "wallAtStart"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "wallAtEnd")));
            this.setWallAttributes(wall, name, attributesMap);
            this.home.addWall(wall);
            var levelId = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "level");
            if (levelId != null) {
                wall.setLevel(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.levels, levelId));
            }
        }
        else if (("baseboard" === name)) {
            var baseboard = this.createBaseboard(attributesMap);
            if (("leftSideBaseboard" === (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "attribute"))) {
                this.leftSideBaseboard = baseboard;
            }
            else {
                this.rightSideBaseboard = baseboard;
            }
        }
        else if (("room" === name)) {
            var room = this.createRoom(attributesMap, /* toArray */ this.points.slice(0));
            this.setRoomAttributes(room, name, attributesMap);
            this.home.addRoom$com_eteks_sweethome3d_model_Room(room);
            var levelId = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "level");
            if (levelId != null) {
                room.setLevel(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.levels, levelId));
            }
        }
        else if (("polyline" === name)) {
            var polyline = this.createPolyline(attributesMap, /* toArray */ this.points.slice(0));
            this.setPolylineAttributes(polyline, name, attributesMap);
            this.home.addPolyline$com_eteks_sweethome3d_model_Polyline(polyline);
            var levelId = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "level");
            if (levelId != null) {
                polyline.setLevel(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.levels, levelId));
            }
        }
        else if (("dimensionLine" === name)) {
            var dimensionLine = this.createDimensionLine(attributesMap);
            this.setDimensionLineAttributes(dimensionLine, name, attributesMap);
            this.home.addDimensionLine(dimensionLine);
            var levelId = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "level");
            if (levelId != null) {
                dimensionLine.setLevel(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.levels, levelId));
            }
        }
        else if (("label" === name)) {
            var label = this.createLabel(attributesMap, this.labelText);
            this.setLabelAttributes(label, name, attributesMap);
            this.home.addLabel(label);
            var levelId = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "level");
            if (levelId != null) {
                label.setLevel(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.levels, levelId));
            }
        }
        else if (("text" === name)) {
            this.labelText = this.getCharacters();
        }
        else if (("textStyle" === name)) {
            var attribute = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "attribute");
            /* put */ (this.textStyles[attribute != null ? attribute : HomeXMLHandler.UNIQUE_ATTRIBUTE] = this.createTextStyle(attributesMap));
        }
        else if (("texture" === name)) {
            if (("material" === parent)) {
                this.materialTexture = this.createTexture(attributesMap);
            }
            else {
                var attribute = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "attribute");
                /* put */ (this.textures[attribute != null ? attribute : HomeXMLHandler.UNIQUE_ATTRIBUTE] = this.createTexture(attributesMap));
            }
        }
        else if (("material" === name)) {
            /* add */ this.materials.push(this.createMaterial(attributesMap));
        }
        else if (("point" === name)) {
            /* add */ this.points.push([this.parseFloat(attributesMap, "x"), this.parseFloat(attributesMap, "y")]);
        }
        else if (("sash" === name)) {
            /* add */ this.sashes.push(new Sash(this.parseFloat(attributesMap, "xAxis"), this.parseFloat(attributesMap, "yAxis"), this.parseFloat(attributesMap, "width"), this.parseFloat(attributesMap, "startAngle"), this.parseFloat(attributesMap, "endAngle")));
        }
        else if (("lightSource" === name)) {
            /* add */ this.lightSources.push(new LightSource(this.parseFloat(attributesMap, "x"), this.parseFloat(attributesMap, "y"), this.parseFloat(attributesMap, "z"), this.parseOptionalColor(attributesMap, "color"), this.parseOptionalFloat(attributesMap, "diameter")));
        }
        else if (("backgroundImage" === name)) {
            var backgroundImage = new BackgroundImage(this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "image")), this.parseFloat(attributesMap, "scaleDistance"), this.parseFloat(attributesMap, "scaleDistanceXStart"), this.parseFloat(attributesMap, "scaleDistanceYStart"), this.parseFloat(attributesMap, "scaleDistanceXEnd"), this.parseFloat(attributesMap, "scaleDistanceYEnd"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "xOrigin") != null ? this.parseFloat(attributesMap, "xOrigin") : 0, /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "yOrigin") != null ? this.parseFloat(attributesMap, "yOrigin") : 0, !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "visible")));
            if (this.homeElementName != null && (this.homeElementName === parent)) {
                this.homeBackgroundImage = backgroundImage;
            }
            else {
                this.backgroundImage = backgroundImage;
            }
        }
        else if (("property" === name)) {
            if (this.homeElementName != null) {
                if ((this.homeElementName === parent)) {
                    /* put */ (this.homeProperties[(function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "name")] = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "value"));
                }
                else {
                    /* put */ (this.properties[(function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "name")] = (function (m, k) { return m[k] ? m[k] : null; })(attributesMap, "value"));
                }
            }
        }
    };
    /**
     * Returns the trimmed string of last element value.
     * @return {string}
     * @private
     */
    HomeXMLHandler.prototype.getCharacters = function () {
        return this.buffer.str;
    };
    HomeXMLHandler.prototype.endDocument = function () {
        {
            var array122 = (function (obj) { return Object.keys(obj).map(function (key) { return obj[key]; }); })(this.joinedWalls);
            for (var index121 = 0; index121 < array122.length; index121++) {
                var joinedWall = array122[index121];
                {
                    var wall = joinedWall.getWall();
                    if (joinedWall.getWallAtStartId() != null) {
                        var joinedWallAtStart = (function (m, k) { return m[k] ? m[k] : null; })(this.joinedWalls, joinedWall.getWallAtStartId());
                        if (joinedWallAtStart != null) {
                            wall.setWallAtStart(joinedWallAtStart.getWall());
                        }
                    }
                    if (joinedWall.getWallAtEndId() != null) {
                        var joinedWallAtEnd = (function (m, k) { return m[k] ? m[k] : null; })(this.joinedWalls, joinedWall.getWallAtEndId());
                        if (joinedWallAtEnd != null) {
                            wall.setWallAtEnd(joinedWallAtEnd.getWall());
                        }
                    }
                }
            }
        }
    };
    /**
     * Returns a new {@link Home} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @return {Home}
     * @private
     */
    HomeXMLHandler.prototype.createHome = function (attributes) {
        if ((function (m, k) { return m[k] ? m[k] : null; })(attributes, "wallHeight") != null) {
            return new Home(this.parseFloat(attributes, "wallHeight"));
        }
        else {
            return new Home();
        }
    };
    /**
     * Sets the attributes of the given <code>home</code>.
     * If needed, this method should be called from {@link #endElement}.
     * @param {Home} home
     * @param {string} elementName
     * @param {*} attributes
     */
    HomeXMLHandler.prototype.setHomeAttributes = function (home, elementName, attributes) {
        {
            var array124 = (function (o) { var s = []; for (var e in o)
                s.push({ k: e, v: o[e], getKey: function () { return this.k; }, getValue: function () { return this.v; } }); return s; })(this.homeProperties);
            for (var index123 = 0; index123 < array124.length; index123++) {
                var property = array124[index123];
                {
                    home.setProperty(property.getKey(), property.getValue());
                }
            }
        }
        if (this.furnitureVisibleProperties.length > 0) {
            this.home.setFurnitureVisibleProperties(this.furnitureVisibleProperties);
        }
        this.home.setBackgroundImage(this.homeBackgroundImage);
        var version = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "version");
        if (version != null) {
            try {
                home.setVersion(parseInt(version));
            }
            catch (ex) {
                throw new SAXException("Invalid value for integer attribute version", ex);
            }
            ;
        }
        home.setName(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "name"));
        var selectedLevelId = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "selectedLevel");
        if (selectedLevelId != null) {
            this.home.setSelectedLevel(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.levels, selectedLevelId));
        }
        if (("observerCamera" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "camera"))) {
            this.home.setCamera(this.home.getObserverCamera());
        }
        home.setBasePlanLocked(/* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "basePlanLocked")));
        var furnitureSortedProperty = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "furnitureSortedProperty");
        if (furnitureSortedProperty != null) {
            try {
                home.setFurnitureSortedProperty(/* valueOf */ furnitureSortedProperty);
            }
            catch (ex) {
            }
            ;
        }
        home.setFurnitureDescendingSorted(/* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "furnitureDescendingSorted")));
        if (attributes['structure']) {
            home['structure'] = this.parseContent(attributes['structure']);
        }
    };
    /**
     * Sets the attributes of the given <code>environment</code>.
     * If needed, this method should be called from {@link #endElement}.
     * @param {HomeEnvironment} environment
     * @param {string} elementName
     * @param {*} attributes
     * @private
     */
    HomeXMLHandler.prototype.setEnvironmentAttributes = function (environment, elementName, attributes) {
        var groundColor = this.parseOptionalColor(attributes, "groundColor");
        if (groundColor != null) {
            environment.setGroundColor(groundColor);
        }
        environment.setGroundTexture(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textures, "groundTexture"));
        var skyColor = this.parseOptionalColor(attributes, "skyColor");
        if (skyColor != null) {
            environment.setSkyColor(skyColor);
        }
        environment.setSkyTexture(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textures, "skyTexture"));
        var lightColor = this.parseOptionalColor(attributes, "lightColor");
        if (lightColor != null) {
            environment.setLightColor(lightColor);
        }
        var wallsAlpha = this.parseOptionalFloat(attributes, "wallsAlpha");
        if (wallsAlpha != null) {
            environment.setWallsAlpha(wallsAlpha);
        }
        environment.setAllLevelsVisible(/* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "allLevelsVisible")));
        environment.setObserverCameraElevationAdjusted(!("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "observerCameraElevationAdjusted")));
        var ceillingLightColor = this.parseOptionalColor(attributes, "ceillingLightColor");
        if (ceillingLightColor != null) {
            environment.setCeillingLightColor(ceillingLightColor);
        }
        var drawingMode = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "drawingMode");
        if (drawingMode != null) {
            try {
                environment.setDrawingMode(HomeEnvironment.DrawingMode[drawingMode]);
            }
            catch (ex) {
            }
            ;
        }
        var subpartSizeUnderLight = this.parseOptionalFloat(attributes, "subpartSizeUnderLight");
        if (subpartSizeUnderLight != null) {
            environment.setSubpartSizeUnderLight(subpartSizeUnderLight);
        }
        var photoWidth = this.parseOptionalInteger(attributes, "photoWidth");
        if (photoWidth != null) {
            environment.setPhotoWidth(photoWidth);
        }
        var photoHeight = this.parseOptionalInteger(attributes, "photoHeight");
        if (photoHeight != null) {
            environment.setPhotoHeight(photoHeight);
        }
        var photoAspectRatio = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "photoAspectRatio");
        if (photoAspectRatio != null) {
            try {
                environment.setPhotoAspectRatio(AspectRatio[photoAspectRatio]);
            }
            catch (ex) {
            }
            ;
        }
        var photoQuality = this.parseOptionalInteger(attributes, "photoQuality");
        if (photoQuality != null) {
            environment.setPhotoQuality(photoQuality);
        }
        var videoWidth = this.parseOptionalInteger(attributes, "videoWidth");
        if (videoWidth != null) {
            environment.setVideoWidth(videoWidth);
        }
        var videoAspectRatio = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "videoAspectRatio");
        if (videoAspectRatio != null) {
            try {
                environment.setVideoAspectRatio(AspectRatio[videoAspectRatio]);
            }
            catch (ex) {
            }
            ;
        }
        var videoQuality = this.parseOptionalInteger(attributes, "videoQuality");
        if (videoQuality != null) {
            environment.setVideoQuality(videoQuality);
        }
        var videoFrameRate = this.parseOptionalInteger(attributes, "videoFrameRate");
        if (videoFrameRate != null) {
            environment.setVideoFrameRate(videoFrameRate);
        }
    };
    /**
     * Returns a new {@link Print} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @return {HomePrint}
     */
    HomeXMLHandler.prototype.createPrint = function (attributes) {
        var paperOrientation = HomePrint.PaperOrientation.PORTRAIT;
        try {
            if ((function (m, k) { return m[k] ? m[k] : null; })(attributes, "paperOrientation") == null) {
                throw new SAXException("Missing paperOrientation attribute");
            }
            paperOrientation = HomePrint.PaperOrientation[(function (m, k) { return m[k] ? m[k] : null; })(attributes, "paperOrientation")];
        }
        catch (ex) {
        }
        ;
        return new HomePrint(paperOrientation, this.parseFloat(attributes, "paperWidth"), this.parseFloat(attributes, "paperHeight"), this.parseFloat(attributes, "paperTopMargin"), this.parseFloat(attributes, "paperLeftMargin"), this.parseFloat(attributes, "paperBottomMargin"), this.parseFloat(attributes, "paperRightMargin"), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "furniturePrinted")), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "planPrinted")), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "view3DPrinted")), this.parseOptionalFloat(attributes, "planScale"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "headerFormat"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "footerFormat"));
    };
    /**
     * Sets the attributes of the given <code>compass</code>.
     * If needed, this method should be called from {@link #endElement}.
     * @param {Compass} compass
     * @param {string} elementName
     * @param {*} attributes
     */
    HomeXMLHandler.prototype.setCompassAttributes = function (compass, elementName, attributes) {
        this.setProperties(compass);
        compass.setX(this.parseOptionalFloat(attributes, "x"));
        compass.setY(this.parseOptionalFloat(attributes, "y"));
        compass.setDiameter(this.parseOptionalFloat(attributes, "diameter"));
        var northDirection = this.parseOptionalFloat(attributes, "northDirection");
        if (northDirection != null) {
            compass.setNorthDirection(northDirection);
        }
        var longitude = this.parseOptionalFloat(attributes, "longitude");
        if (longitude != null) {
            compass.setLongitude(longitude);
        }
        var latitude = this.parseOptionalFloat(attributes, "latitude");
        if (latitude != null) {
            compass.setLatitude(latitude);
        }
        var timeZone = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "timeZone");
        if (timeZone != null) {
            compass.setTimeZone(timeZone);
        }
        compass.setVisible(!("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "visible")));
    };
    /**
     * Returns a new {@link Camera} instance initialized from the given <code>attributes</code>.
     * @param {string} elementName
     * @param {*} attributes
     * @return {Camera}
     * @private
     */
    HomeXMLHandler.prototype.createCamera = function (elementName, attributes) {
        if (("observerCamera" === elementName)) {
            return new ObserverCamera(this.parseFloat(attributes, "x"), this.parseFloat(attributes, "y"), this.parseFloat(attributes, "z"), this.parseFloat(attributes, "yaw"), this.parseFloat(attributes, "pitch"), this.parseFloat(attributes, "fieldOfView"));
        }
        else {
            return new Camera(this.parseFloat(attributes, "x"), this.parseFloat(attributes, "y"), this.parseFloat(attributes, "z"), this.parseFloat(attributes, "yaw"), this.parseFloat(attributes, "pitch"), this.parseFloat(attributes, "fieldOfView"));
        }
    };
    /**
     * Sets the attributes of the given <code>camera</code>.
     * If needed, this method should be called from {@link #endElement}.
     * @param {Camera} camera
     * @param {string} elementName
     * @param {*} attributes
     */
    HomeXMLHandler.prototype.setCameraAttributes = function (camera, elementName, attributes) {
        this.setProperties(camera);
        if (camera != null && camera instanceof ObserverCamera) {
            camera.setFixedSize(/* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "fixedSize")));
        }
        var lens = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "lens");
        if (lens != null) {
            try {
                camera.setLens(Camera.Lens[lens]);
            }
            catch (ex) {
            }
            ;
        }
        var time = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "time");
        if (time != null) {
            try {
                camera.setTime(parseInt(time));
            }
            catch (ex) {
                throw new SAXException("Invalid value for long attribute time", ex);
            }
            ;
        }
        camera.setName(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "name"));
    };
    /**
     * Returns a new {@link Level} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @return {Level}
     * @private
     */
    HomeXMLHandler.prototype.createLevel = function (attributes) {
        return new Level(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "name"), this.parseFloat(attributes, "elevation"), this.parseFloat(attributes, "floorThickness"), this.parseFloat(attributes, "height"));
    };
    /**
     * Sets the attributes of the given <code>level</code>.
     * If needed, this method should be called from {@link #endElement}.
     * @param {Level} level
     * @param {string} elementName
     * @param {*} attributes
     */
    HomeXMLHandler.prototype.setLevelAttributes = function (level, elementName, attributes) {
        this.setProperties(level);
        level.setBackgroundImage(this.backgroundImage);
        var elevationIndex = this.parseOptionalInteger(attributes, "elevationIndex");
        if (elevationIndex != null) {
            level.setElevationIndex(elevationIndex);
        }
        level.setVisible(!("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "visible")));
        level.setViewable(!("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "viewable")));
    };
    /**
     * Returns a new {@link HomePieceOfFurniture} instance initialized from the given <code>attributes</code>.
     * @param {string} elementName
     * @param {*} attributes
     * @return {HomePieceOfFurniture}
     * @private
     */
    HomeXMLHandler.prototype.createPieceOfFurniture = function (elementName, attributes) {
        var tags = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "tags") != null ? (function (m, k) { return m[k] ? m[k] : null; })(attributes, "tags").split(" ") : null;
        var elevation = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "elevation") != null ? this.parseFloat(attributes, "elevation") : 0;
        var dropOnTopElevation = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "dropOnTopElevation") != null ? this.parseFloat(attributes, "dropOnTopElevation") : 1;
        var modelRotation = null;
        if ((function (m, k) { return m[k] ? m[k] : null; })(attributes, "modelRotation") != null) {
            var values = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "modelRotation").split(" ", 9);
            if (values.length < 9) {
                throw new SAXException("Missing values for attribute modelRotation");
            }
            try {
                modelRotation = [[parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2])], [parseFloat(values[3]), parseFloat(values[4]), parseFloat(values[5])], [parseFloat(values[6]), parseFloat(values[7]), parseFloat(values[8])]];
            }
            catch (ex) {
                throw new SAXException("Invalid value for attribute modelRotation", ex);
            }
            ;
        }
        if (("doorOrWindow" === elementName) || ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "doorOrWindow"))) {
            var wallThickness = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "wallThickness") != null ? this.parseFloat(attributes, "wallThickness") : 1;
            var wallDistance = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "wallDistance") != null ? this.parseFloat(attributes, "wallDistance") : 0;
            var cutOutShape = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "cutOutShape");
            if (cutOutShape == null && !("doorOrWindow" === elementName)) {
                cutOutShape = "M0,0 v1 h1 v-1 z";
            }
            return new HomeDoorOrWindow(new CatalogDoorOrWindow(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "catalogId"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "name"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "description"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "information"), tags, this.parseOptionalLong(attributes, "creationDate"), this.parseOptionalFloat(attributes, "grade"), this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "icon")), this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "planIcon")), this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "model")), this.parseFloat(attributes, "width"), this.parseFloat(attributes, "depth"), this.parseFloat(attributes, "height"), elevation, dropOnTopElevation, !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "movable")), cutOutShape, wallThickness, wallDistance, /* toArray */ this.sashes.slice(0), modelRotation, /* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "backFaceShown")), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "creator"), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "resizable")), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "deformable")), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "texturable")), this.parseOptionalDecimal(attributes, "price"), this.parseOptionalDecimal(attributes, "valueAddedTaxPercentage"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "currency")));
        }
        else if (("light" === elementName)) {
            return new HomeLight(new CatalogLight(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "catalogId"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "name"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "description"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "information"), tags, this.parseOptionalLong(attributes, "creationDate"), this.parseOptionalFloat(attributes, "grade"), this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "icon")), this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "planIcon")), this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "model")), this.parseFloat(attributes, "width"), this.parseFloat(attributes, "depth"), this.parseFloat(attributes, "height"), elevation, dropOnTopElevation, !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "movable")), /* toArray */ this.lightSources.slice(0), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "staircaseCutOutShape"), modelRotation, /* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "backFaceShown")), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "creator"), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "resizable")), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "deformable")), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "texturable")), this.parseOptionalDecimal(attributes, "price"), this.parseOptionalDecimal(attributes, "valueAddedTaxPercentage"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "currency")));
        }
        else {
            return new HomePieceOfFurniture(new CatalogPieceOfFurniture(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "catalogId"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "name"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "description"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "information"), tags, this.parseOptionalLong(attributes, "creationDate"), this.parseOptionalFloat(attributes, "grade"), this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "icon")), this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "planIcon")), this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "model")), this.parseFloat(attributes, "width"), this.parseFloat(attributes, "depth"), this.parseFloat(attributes, "height"), elevation, dropOnTopElevation, !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "movable")), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "staircaseCutOutShape"), modelRotation, /* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "backFaceShown")), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "creator"), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "resizable")), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "deformable")), !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "texturable")), this.parseOptionalDecimal(attributes, "price"), this.parseOptionalDecimal(attributes, "valueAddedTaxPercentage"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "currency")));
        }
    };
    /**
     * Returns a new {@link HomeFurnitureGroup} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @param {Array} furniture
     * @return {HomeFurnitureGroup}
     * @private
     */
    HomeXMLHandler.prototype.createFurnitureGroup = function (attributes, furniture) {
        return new HomeFurnitureGroup(furniture, /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "angle") != null ? this.parseFloat(attributes, "angle") : 0, /* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "modelMirrored")), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "name"));
    };
    /**
     * Sets the attributes of the given <code>piece</code>.
     * If needed, this method should be called from {@link #endElement}.
     * @param {HomePieceOfFurniture} piece
     * @param {string} elementName
     * @param {*} attributes
     */
    HomeXMLHandler.prototype.setPieceOfFurnitureAttributes = function (piece, elementName, attributes) {
        this.setProperties(piece);
        piece.setNameStyle(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textStyles, "nameStyle"));
        piece.setNameVisible(/* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "nameVisible")));
        var nameAngle = this.parseOptionalFloat(attributes, "nameAngle");
        if (nameAngle != null) {
            piece.setNameAngle(nameAngle);
        }
        var nameXOffset = this.parseOptionalFloat(attributes, "nameXOffset");
        if (nameXOffset != null) {
            piece.setNameXOffset(nameXOffset);
        }
        var nameYOffset = this.parseOptionalFloat(attributes, "nameYOffset");
        if (nameYOffset != null) {
            piece.setNameYOffset(nameYOffset);
        }
        piece.setVisible(!("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "visible")));
        if (!(piece != null && piece instanceof HomeFurnitureGroup)) {
            var x = this.parseOptionalFloat(attributes, "x");
            if (x != null) {
                piece.setX(x);
            }
            var y = this.parseOptionalFloat(attributes, "y");
            if (y != null) {
                piece.setY(y);
            }
            var angle = this.parseOptionalFloat(attributes, "angle");
            if (angle != null) {
                piece.setAngle(angle);
            }
            if (piece.isResizable()) {
                piece.setModelMirrored(/* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "modelMirrored")));
            }
            if (piece.isTexturable()) {
                if (this.materials.length > 0) {
                    piece.setModelMaterials(/* toArray */ this.materials.slice(0));
                }
                var color = this.parseOptionalColor(attributes, "color");
                if (color != null) {
                    piece.setColor(color);
                }
                var texture = (function (m, k) { return m[k] ? m[k] : null; })(this.textures, HomeXMLHandler.UNIQUE_ATTRIBUTE);
                if (texture != null) {
                    piece.setTexture(texture);
                }
                var shininess = this.parseOptionalFloat(attributes, "shininess");
                if (shininess != null) {
                    piece.setShininess(shininess);
                }
            }
            if ((piece != null && piece instanceof HomeLight) && (function (m, k) { return m[k] ? m[k] : null; })(attributes, "power") != null) {
                piece.setPower(this.parseFloat(attributes, "power"));
            }
            else if ((piece != null && piece instanceof HomeDoorOrWindow) && ("doorOrWindow" === elementName)) {
                piece.setBoundToWall(!("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "boundToWall")));
            }
        }
    };
    /**
     * Returns a new {@link Wall} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @return {Wall}
     * @private
     */
    HomeXMLHandler.prototype.createWall = function (attributes) {
        return new Wall(this.parseFloat(attributes, "xStart"), this.parseFloat(attributes, "yStart"), this.parseFloat(attributes, "xEnd"), this.parseFloat(attributes, "yEnd"), this.parseFloat(attributes, "thickness"), 0);
    };
    /**
     * Sets the attributes of the given <code>wall</code>.
     * If needed, this method should be called from {@link #endElement}.
     * @param {Wall} wall
     * @param {string} elementName
     * @param {*} attributes
     */
    HomeXMLHandler.prototype.setWallAttributes = function (wall, elementName, attributes) {
        this.setProperties(wall);
        wall.setLeftSideBaseboard(this.leftSideBaseboard);
        wall.setRightSideBaseboard(this.rightSideBaseboard);
        wall.setHeight(this.parseOptionalFloat(attributes, "height"));
        wall.setHeightAtEnd(this.parseOptionalFloat(attributes, "heightAtEnd"));
        wall.setArcExtent(this.parseOptionalFloat(attributes, "arcExtent"));
        wall.setTopColor(this.parseOptionalColor(attributes, "topColor"));
        wall.setLeftSideColor(this.parseOptionalColor(attributes, "leftSideColor"));
        wall.setLeftSideTexture(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textures, "leftSideTexture"));
        var leftSideShininess = this.parseOptionalFloat(attributes, "leftSideShininess");
        if (leftSideShininess != null) {
            wall.setLeftSideShininess(leftSideShininess);
        }
        wall.setRightSideColor(this.parseOptionalColor(attributes, "rightSideColor"));
        wall.setRightSideTexture(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textures, "rightSideTexture"));
        var rightSideShininess = this.parseOptionalFloat(attributes, "rightSideShininess");
        if (rightSideShininess != null) {
            wall.setRightSideShininess(rightSideShininess);
        }
        var pattern = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "pattern");
        if (pattern != null) {
            try {
                wall.setPattern(this.preferences.getPatternsCatalog().getPattern$java_lang_String(pattern));
            }
            catch (ex) {
            }
            ;
        }
    };
    /**
     * Returns a new {@link Room} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @param {Array} points
     * @return {Room}
     * @private
     */
    HomeXMLHandler.prototype.createRoom = function (attributes, points) {
        return new Room(points);
    };
    /**
     * Sets the attributes of the given <code>room</code>.
     * If needed, this method should be called from {@link #endElement}.
     * @param {Room} room
     * @param {string} elementName
     * @param {*} attributes
     */
    HomeXMLHandler.prototype.setRoomAttributes = function (room, elementName, attributes) {
        this.setProperties(room);
        room.setNameStyle(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textStyles, "nameStyle"));
        room.setAreaStyle(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textStyles, "areaStyle"));
        room.setName(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "name"));
        var nameAngle = this.parseOptionalFloat(attributes, "nameAngle");
        if (nameAngle != null) {
            room.setNameAngle(nameAngle);
        }
        var nameXOffset = this.parseOptionalFloat(attributes, "nameXOffset");
        if (nameXOffset != null) {
            room.setNameXOffset(nameXOffset);
        }
        var nameYOffset = this.parseOptionalFloat(attributes, "nameYOffset");
        if (nameYOffset != null) {
            room.setNameYOffset(nameYOffset);
        }
        room.setAreaVisible(/* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "areaVisible")));
        var areaAngle = this.parseOptionalFloat(attributes, "areaAngle");
        if (areaAngle != null) {
            room.setAreaAngle(areaAngle);
        }
        var areaXOffset = this.parseOptionalFloat(attributes, "areaXOffset");
        if (areaXOffset != null) {
            room.setAreaXOffset(areaXOffset);
        }
        var areaYOffset = this.parseOptionalFloat(attributes, "areaYOffset");
        if (areaYOffset != null) {
            room.setAreaYOffset(areaYOffset);
        }
        room.setFloorVisible(!("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "floorVisible")));
        room.setFloorColor(this.parseOptionalColor(attributes, "floorColor"));
        room.setFloorTexture(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textures, "floorTexture"));
        var floorShininess = this.parseOptionalFloat(attributes, "floorShininess");
        if (floorShininess != null) {
            room.setFloorShininess(floorShininess);
        }
        room.setCeilingVisible(!("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "ceilingVisible")));
        room.setCeilingColor(this.parseOptionalColor(attributes, "ceilingColor"));
        room.setCeilingTexture(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textures, "ceilingTexture"));
        var ceilingShininess = this.parseOptionalFloat(attributes, "ceilingShininess");
        if (ceilingShininess != null) {
            room.setCeilingShininess(ceilingShininess);
        }
    };
    /**
     * Returns a new {@link Polyline} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @param {Array} points
     * @return {Polyline}
     * @private
     */
    HomeXMLHandler.prototype.createPolyline = function (attributes, points) {
        return new Polyline(points);
    };
    /**
     * Sets the attributes of the given <code>polyline</code>.
     * If needed, this method should be called from {@link #endElement}.
     * @param {Polyline} polyline
     * @param {string} elementName
     * @param {*} attributes
     */
    HomeXMLHandler.prototype.setPolylineAttributes = function (polyline, elementName, attributes) {
        this.setProperties(polyline);
        var thickness = this.parseOptionalFloat(attributes, "thickness");
        if (thickness != null) {
            polyline.setThickness(thickness);
        }
        var capStyle = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "capStyle");
        if (capStyle != null) {
            try {
                polyline.setCapStyle(Polyline.CapStyle[capStyle]);
            }
            catch (ex) {
            }
            ;
        }
        var joinStyle = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "joinStyle");
        if (joinStyle != null) {
            try {
                polyline.setJoinStyle(Polyline.JoinStyle[joinStyle]);
            }
            catch (ex) {
            }
            ;
        }
        var dashStyle = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "dashStyle");
        if (dashStyle != null) {
            try {
                polyline.setDashStyle(Polyline.DashStyle[dashStyle]);
            }
            catch (ex) {
            }
            ;
        }
        var startArrowStyle = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "startArrowStyle");
        if (startArrowStyle != null) {
            try {
                polyline.setStartArrowStyle(Polyline.ArrowStyle[startArrowStyle]);
            }
            catch (ex) {
            }
            ;
        }
        var endArrowStyle = (function (m, k) { return m[k] ? m[k] : null; })(attributes, "endArrowStyle");
        if (endArrowStyle != null) {
            try {
                polyline.setEndArrowStyle(Polyline.ArrowStyle[endArrowStyle]);
            }
            catch (ex) {
            }
            ;
        }
        var color = this.parseOptionalColor(attributes, "color");
        if (color != null) {
            polyline.setColor(color);
        }
        polyline.setClosedPath(/* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "closedPath")));
    };
    /**
     * Returns a new {@link DimensionLine} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @return {DimensionLine}
     * @private
     */
    HomeXMLHandler.prototype.createDimensionLine = function (attributes) {
        return new DimensionLine(this.parseFloat(attributes, "xStart"), this.parseFloat(attributes, "yStart"), this.parseFloat(attributes, "xEnd"), this.parseFloat(attributes, "yEnd"), this.parseFloat(attributes, "offset"));
    };
    /**
     * Sets the attributes of the given dimension line.
     * If needed, this method should be called from {@link #endElement}.
     * @param {DimensionLine} dimensionLine
     * @param {string} elementName
     * @param {*} attributes
     */
    HomeXMLHandler.prototype.setDimensionLineAttributes = function (dimensionLine, elementName, attributes) {
        this.setProperties(dimensionLine);
        dimensionLine.setLengthStyle(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textStyles, "lengthStyle"));
    };
    /**
     * Returns a new {@link Label} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @param {string} text
     * @return {Label}
     * @private
     */
    HomeXMLHandler.prototype.createLabel = function (attributes, text) {
        return new Label(text, this.parseFloat(attributes, "x"), this.parseFloat(attributes, "y"));
    };
    /**
     * Sets the attributes of the given <code>label</code>.
     * If needed, this method should be called from {@link #endElement}.
     * @param {Label} label
     * @param {string} elementName
     * @param {*} attributes
     */
    HomeXMLHandler.prototype.setLabelAttributes = function (label, elementName, attributes) {
        this.setProperties(label);
        label.setStyle(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textStyles, HomeXMLHandler.UNIQUE_ATTRIBUTE));
        var angle = this.parseOptionalFloat(attributes, "angle");
        if (angle != null) {
            label.setAngle(angle);
        }
        var elevation = this.parseOptionalFloat(attributes, "elevation");
        if (elevation != null) {
            label.setElevation(elevation);
        }
        var pitch = this.parseOptionalFloat(attributes, "pitch");
        if (pitch != null) {
            label.setPitch(pitch);
        }
        label.setColor(this.parseOptionalColor(attributes, "color"));
        label.setOutlineColor(this.parseOptionalColor(attributes, "outlineColor"));
    };
    /**
     * Returns a new {@link Baseboard} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @return {Baseboard}
     * @private
     */
    HomeXMLHandler.prototype.createBaseboard = function (attributes) {
        return Baseboard.getInstance(this.parseFloat(attributes, "thickness"), this.parseFloat(attributes, "height"), this.parseOptionalColor(attributes, "color"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(this.textures, HomeXMLHandler.UNIQUE_ATTRIBUTE));
    };
    /**
     * Returns a new {@link TextStyle} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @return {TextStyle}
     * @private
     */
    HomeXMLHandler.prototype.createTextStyle = function (attributes) {
        return new TextStyle(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "fontName"), this.parseFloat(attributes, "fontSize"), /* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "bold")), /* equals */ ("true" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "italic")));
    };
    /**
     * Returns a new {@link HomeTexture} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @return {HomeTexture}
     * @private
     */
    HomeXMLHandler.prototype.createTexture = function (attributes) {
        return new HomeTexture(new CatalogTexture(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "catalogId"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "name"), this.parseContent(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "image")), this.parseFloat(attributes, "width"), this.parseFloat(attributes, "height"), null), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "angle") != null ? this.parseFloat(attributes, "angle") : 0, !("false" === (function (m, k) { return m[k] ? m[k] : null; })(attributes, "leftToRightOriented")));
    };
    /**
     * Returns a new {@link HomeMaterial} instance initialized from the given <code>attributes</code>.
     * @param {*} attributes
     * @return {HomeMaterial}
     * @private
     */
    HomeXMLHandler.prototype.createMaterial = function (attributes) {
        return new HomeMaterial(/* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "name"), /* get */ (function (m, k) { return m[k] ? m[k] : null; })(attributes, "key"), this.parseOptionalColor(attributes, "color"), this.materialTexture, this.parseOptionalFloat(attributes, "shininess"));
    };
    /**
     * Sets the properties of the given <code>object</code>.
     * @param {HomeObject} object
     * @private
     */
    HomeXMLHandler.prototype.setProperties = function (object) {
        {
            var array126 = (function (o) { var s = []; for (var e in o)
                s.push({ k: e, v: o[e], getKey: function () { return this.k; }, getValue: function () { return this.v; } }); return s; })(this.properties);
            for (var index125 = 0; index125 < array126.length; index125++) {
                var property = array126[index125];
                {
                    object.setProperty(property.getKey(), property.getValue());
                }
            }
        }
    };
    /**
     * Returns the color integer from a hexadecimal string.
     * @param {*} attributes
     * @param {string} name
     * @return {number}
     * @private
     */
    HomeXMLHandler.prototype.parseOptionalColor = function (attributes, name) {
        var color = (function (m, k) { return m[k] ? m[k] : null; })(attributes, name);
        if (color != null) {
            try {
                return (parseInt(color, 16) | 0);
            }
            catch (ex) {
                throw new SAXException("Invalid value for color attribute " + name, ex);
            }
            ;
        }
        else {
            return null;
        }
    };
    HomeXMLHandler.prototype.parseOptionalInteger = function (attributes, name) {
        var value = (function (m, k) { return m[k] ? m[k] : null; })(attributes, name);
        if (value != null) {
            try {
                return parseInt(value);
            }
            catch (ex) {
                throw new SAXException("Invalid value for integer attribute " + name, ex);
            }
            ;
        }
        else {
            return null;
        }
    };
    HomeXMLHandler.prototype.parseOptionalLong = function (attributes, name) {
        var value = (function (m, k) { return m[k] ? m[k] : null; })(attributes, name);
        if (value != null) {
            try {
                return parseInt(value);
            }
            catch (ex) {
                throw new SAXException("Invalid value for long attribute " + name, ex);
            }
            ;
        }
        else {
            return null;
        }
    };
    HomeXMLHandler.prototype.parseOptionalDecimal = function (attributes, name) {
        var value = (function (m, k) { return m[k] ? m[k] : null; })(attributes, name);
        if (value != null) {
            try {
                return new Big(value);
            }
            catch (ex) {
                throw new SAXException("Invalid value for decimal attribute " + name, ex);
            }
            ;
        }
        else {
            return null;
        }
    };
    HomeXMLHandler.prototype.parseOptionalFloat = function (attributes, name) {
        var value = (function (m, k) { return m[k] ? m[k] : null; })(attributes, name);
        if (value != null) {
            try {
                return parseFloat(value);
            }
            catch (ex) {
                throw new SAXException("Invalid value for float attribute " + name, ex);
            }
            ;
        }
        else {
            return null;
        }
    };
    HomeXMLHandler.prototype.parseFloat = function (attributes, name) {
        var value = (function (m, k) { return m[k] ? m[k] : null; })(attributes, name);
        if (value != null) {
            try {
                return parseFloat(value);
            }
            catch (ex) {
                throw new SAXException("Invalid value for float attribute " + name, ex);
            }
            ;
        }
        else {
            throw new SAXException("Missing float attribute " + name);
        }
    };
    /**
     * Returns the content object matching the given string.
     * @param {string} content
     * @return {Content}
     * @private
     */
    HomeXMLHandler.prototype.parseContent = function (content) {
        if (content == null) {
            return null;
        }
        else if (content.indexOf('://') >= 0) {
            return new URLContent(content);
        }
        else {
            return new HomeURLContent('jar:' + this['homeUrl'] + '!/' + content);
        }
    };
    /**
     * Sets the home that will be updated by this handler.
     * If a subclass of this handler uses a root element different from <code>home</code>,
     * it should call this method from {@link #startElement} to store the
     * {@link Home} subclass instance read from the XML stream.
     * @param {Home} home
     */
    HomeXMLHandler.prototype.setHome = function (home) {
        this.home = home;
        this.homeElementName = (function (s) { return s[s.length - 1]; })(this.elements);
    };
    /**
     * Returns the home read by this handler.
     * @return {Home}
     */
    HomeXMLHandler.prototype.getHome = function () {
        return this.home;
    };
    return HomeXMLHandler;
}(DefaultHandler));
HomeXMLHandler.UNIQUE_ATTRIBUTE = "@&unique&@";
HomeXMLHandler["__class"] = "HomeXMLHandler";
HomeXMLHandler["__interfaces"] = ["org.xml.sax.ErrorHandler", "org.xml.sax.DTDHandler", "org.xml.sax.ContentHandler", "org.xml.sax.EntityResolver"];
(function (HomeXMLHandler) {
    /**
     * Class storing the ID of the walls connected to a given wall.
     */
    var JoinedWall = (function () {
        function JoinedWall(wall, wallAtStartId, wallAtEndId) {
            this.wall = null;
            this.wallAtStartId = null;
            this.wallAtEndId = null;
            this.wall = wall;
            this.wallAtStartId = wallAtStartId;
            this.wallAtEndId = wallAtEndId;
        }
        JoinedWall.prototype.getWall = function () {
            return this.wall;
        };
        JoinedWall.prototype.getWallAtStartId = function () {
            return this.wallAtStartId;
        };
        JoinedWall.prototype.getWallAtEndId = function () {
            return this.wallAtEndId;
        };
        return JoinedWall;
    }());
    HomeXMLHandler.JoinedWall = JoinedWall;
    JoinedWall["__class"] = "HomeXMLHandler.JoinedWall";
})(HomeXMLHandler || (HomeXMLHandler = {}));
/**
 * The aspect ratio of pictures.
 * @since 2.0
 * @enum
 */
var AspectRatio;
(function (AspectRatio) {
    AspectRatio[AspectRatio["FREE_RATIO"] = 0] = "FREE_RATIO";
    AspectRatio[AspectRatio["VIEW_3D_RATIO"] = 1] = "VIEW_3D_RATIO";
    AspectRatio[AspectRatio["RATIO_4_3"] = 2] = "RATIO_4_3";
    AspectRatio[AspectRatio["RATIO_3_2"] = 3] = "RATIO_3_2";
    AspectRatio[AspectRatio["RATIO_16_9"] = 4] = "RATIO_16_9";
    AspectRatio[AspectRatio["RATIO_2_1"] = 5] = "RATIO_2_1";
    AspectRatio[AspectRatio["SQUARE_RATIO"] = 6] = "SQUARE_RATIO";
})(AspectRatio || (AspectRatio = {}));
/**
 * The aspect ratio of pictures.
 * @since 2.0
 * @enum
 */
var AspectRatio_$WRAPPER = (function () {
    function AspectRatio_$WRAPPER(_$ordinal, _$name, value) {
        this._$ordinal = _$ordinal;
        this._$name = _$name;
        this.value = null;
        this.value = value;
    }
    /**
     * Returns the value of this aspect ratio (width / height) or <code>null</code> if it's not known.
     * @return {number}
     */
    AspectRatio_$WRAPPER.prototype.getValue = function () {
        return this.value;
    };
    AspectRatio_$WRAPPER.prototype.name = function () { return this._$name; };
    AspectRatio_$WRAPPER.prototype.ordinal = function () { return this._$ordinal; };
    return AspectRatio_$WRAPPER;
}());
AspectRatio["__class"] = "AspectRatio";
AspectRatio["__interfaces"] = ["java.lang.Comparable", "java.io.Serializable"];
AspectRatio["_$wrappers"] = [new AspectRatio_$WRAPPER(0, "FREE_RATIO", null), new AspectRatio_$WRAPPER(1, "VIEW_3D_RATIO", null), new AspectRatio_$WRAPPER(2, "RATIO_4_3", 4.0 / 3), new AspectRatio_$WRAPPER(3, "RATIO_3_2", 1.5), new AspectRatio_$WRAPPER(4, "RATIO_16_9", 16.0 / 9), new AspectRatio_$WRAPPER(5, "RATIO_2_1", 2.0 / 1.0), new AspectRatio_$WRAPPER(6, "SQUARE_RATIO", 1.0)];
/**
 * Creates a background image.
 * @since 1.8
 * @param {Content} image
 * @param {number} scaleDistance
 * @param {number} scaleDistanceXStart
 * @param {number} scaleDistanceYStart
 * @param {number} scaleDistanceXEnd
 * @param {number} scaleDistanceYEnd
 * @param {number} xOrigin
 * @param {number} yOrigin
 * @param {boolean} visible
 * @class
 */
var BackgroundImage = (function () {
    function BackgroundImage(image, scaleDistance, scaleDistanceXStart, scaleDistanceYStart, scaleDistanceXEnd, scaleDistanceYEnd, xOrigin, yOrigin, visible) {
        var _this = this;
        if (((image != null && (image["__interfaces"] != null && image["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || image.constructor != null && image.constructor["__interfaces"] != null && image.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || image === null) && ((typeof scaleDistance === 'number') || scaleDistance === null) && ((typeof scaleDistanceXStart === 'number') || scaleDistanceXStart === null) && ((typeof scaleDistanceYStart === 'number') || scaleDistanceYStart === null) && ((typeof scaleDistanceXEnd === 'number') || scaleDistanceXEnd === null) && ((typeof scaleDistanceYEnd === 'number') || scaleDistanceYEnd === null) && ((typeof xOrigin === 'number') || xOrigin === null) && ((typeof yOrigin === 'number') || yOrigin === null) && ((typeof visible === 'boolean') || visible === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.image = null;
            this.scaleDistance = 0;
            this.scaleDistanceXStart = 0;
            this.scaleDistanceYStart = 0;
            this.scaleDistanceXEnd = 0;
            this.scaleDistanceYEnd = 0;
            this.xOrigin = 0;
            this.yOrigin = 0;
            this.invisible = false;
            this.image = null;
            this.scaleDistance = 0;
            this.scaleDistanceXStart = 0;
            this.scaleDistanceYStart = 0;
            this.scaleDistanceXEnd = 0;
            this.scaleDistanceYEnd = 0;
            this.xOrigin = 0;
            this.yOrigin = 0;
            this.invisible = false;
            (function () {
                _this.image = image;
                _this.scaleDistance = scaleDistance;
                _this.scaleDistanceXStart = scaleDistanceXStart;
                _this.scaleDistanceYStart = scaleDistanceYStart;
                _this.scaleDistanceXEnd = scaleDistanceXEnd;
                _this.scaleDistanceYEnd = scaleDistanceYEnd;
                _this.xOrigin = xOrigin;
                _this.yOrigin = yOrigin;
                _this.invisible = !visible;
            })();
        }
        else if (((image != null && (image["__interfaces"] != null && image["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || image.constructor != null && image.constructor["__interfaces"] != null && image.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || image === null) && ((typeof scaleDistance === 'number') || scaleDistance === null) && ((typeof scaleDistanceXStart === 'number') || scaleDistanceXStart === null) && ((typeof scaleDistanceYStart === 'number') || scaleDistanceYStart === null) && ((typeof scaleDistanceXEnd === 'number') || scaleDistanceXEnd === null) && ((typeof scaleDistanceYEnd === 'number') || scaleDistanceYEnd === null) && ((typeof xOrigin === 'number') || xOrigin === null) && ((typeof yOrigin === 'number') || yOrigin === null) && visible === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_2 = Array.prototype.slice.call(arguments);
                var visible_1 = true;
                this.image = null;
                this.scaleDistance = 0;
                this.scaleDistanceXStart = 0;
                this.scaleDistanceYStart = 0;
                this.scaleDistanceXEnd = 0;
                this.scaleDistanceYEnd = 0;
                this.xOrigin = 0;
                this.yOrigin = 0;
                this.invisible = false;
                this.image = null;
                this.scaleDistance = 0;
                this.scaleDistanceXStart = 0;
                this.scaleDistanceYStart = 0;
                this.scaleDistanceXEnd = 0;
                this.scaleDistanceYEnd = 0;
                this.xOrigin = 0;
                this.yOrigin = 0;
                this.invisible = false;
                (function () {
                    _this.image = image;
                    _this.scaleDistance = scaleDistance;
                    _this.scaleDistanceXStart = scaleDistanceXStart;
                    _this.scaleDistanceYStart = scaleDistanceYStart;
                    _this.scaleDistanceXEnd = scaleDistanceXEnd;
                    _this.scaleDistanceYEnd = scaleDistanceYEnd;
                    _this.xOrigin = xOrigin;
                    _this.yOrigin = yOrigin;
                    _this.invisible = !visible_1;
                })();
            }
        }
        else
            throw new Error('invalid overload');
    }
    /**
     * Returns the image content of this background image.
     * @return {Content}
     */
    BackgroundImage.prototype.getImage = function () {
        return this.image;
    };
    /**
     * Returns the distance used to compute the scale of this image.
     * @return {number}
     */
    BackgroundImage.prototype.getScaleDistance = function () {
        return this.scaleDistance;
    };
    /**
     * Returns the abscissa of the start point used to compute
     * the scale of this image.
     * @return {number}
     */
    BackgroundImage.prototype.getScaleDistanceXStart = function () {
        return this.scaleDistanceXStart;
    };
    /**
     * Returns the ordinate of the start point used to compute
     * the scale of this image.
     * @return {number}
     */
    BackgroundImage.prototype.getScaleDistanceYStart = function () {
        return this.scaleDistanceYStart;
    };
    /**
     * Returns the abscissa of the end point used to compute
     * the scale of this image.
     * @return {number}
     */
    BackgroundImage.prototype.getScaleDistanceXEnd = function () {
        return this.scaleDistanceXEnd;
    };
    /**
     * Returns the ordinate of the end point used to compute
     * the scale of this image.
     * @return {number}
     */
    BackgroundImage.prototype.getScaleDistanceYEnd = function () {
        return this.scaleDistanceYEnd;
    };
    /**
     * Returns the scale of this image.
     * @return {number}
     */
    BackgroundImage.prototype.getScale = function () {
        return BackgroundImage.getScale(this.scaleDistance, this.scaleDistanceXStart, this.scaleDistanceYStart, this.scaleDistanceXEnd, this.scaleDistanceYEnd);
    };
    /**
     * Returns the scale equal to <code>scaleDistance</code> divided
     * by the distance between the points
     * (<code>scaleDistanceXStart</code>, <code>scaleDistanceYStart</code>)
     * and (<code>scaleDistanceXEnd</code>, <code>scaleDistanceYEnd</code>).
     * @param {number} scaleDistance
     * @param {number} scaleDistanceXStart
     * @param {number} scaleDistanceYStart
     * @param {number} scaleDistanceXEnd
     * @param {number} scaleDistanceYEnd
     * @return {number}
     */
    BackgroundImage.getScale = function (scaleDistance, scaleDistanceXStart, scaleDistanceYStart, scaleDistanceXEnd, scaleDistanceYEnd) {
        return (Math.fround ? ((scaleDistance / java.awt.geom.Point2D.distance(scaleDistanceXStart, scaleDistanceYStart, scaleDistanceXEnd, scaleDistanceYEnd))) : Math.fround((scaleDistance / java.awt.geom.Point2D.distance(scaleDistanceXStart, scaleDistanceYStart, scaleDistanceXEnd, scaleDistanceYEnd))));
    };
    /**
     * Returns the origin abscissa of this image.
     * @return {number}
     */
    BackgroundImage.prototype.getXOrigin = function () {
        return this.xOrigin;
    };
    /**
     * Returns the origin ordinate of this image.
     * @return {number}
     */
    BackgroundImage.prototype.getYOrigin = function () {
        return this.yOrigin;
    };
    /**
     * Returns <code>true</code> if this image is visible in plan.
     * @since 1.8
     * @return {boolean}
     */
    BackgroundImage.prototype.isVisible = function () {
        return !this.invisible;
    };
    return BackgroundImage;
}());
BackgroundImage["__class"] = "BackgroundImage";
BackgroundImage["__interfaces"] = ["java.io.Serializable"];
/**
 * A baseboard associated to wall.
 * @author Emmanuel Puybaret
 */
var Baseboard = (function () {
    function Baseboard(thickness, height, color, texture, cached) {
        var _this = this;
        if (((typeof thickness === 'number') || thickness === null) && ((typeof height === 'number') || height === null) && ((typeof color === 'number') || color === null) && ((texture != null && texture instanceof HomeTexture) || texture === null) && ((typeof cached === 'boolean') || cached === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.thickness = 0;
            this.height = 0;
            this.color = null;
            this.texture = null;
            this.thickness = 0;
            this.height = 0;
            this.color = null;
            this.texture = null;
            (function () {
                _this.height = height;
                _this.thickness = thickness;
                _this.color = color;
                _this.texture = texture;
                if (cached) {
                    /* add */ Baseboard.baseboardsCache_$LI$().push(_this);
                }
            })();
        }
        else if (((typeof thickness === 'number') || thickness === null) && ((typeof height === 'number') || height === null) && ((typeof color === 'number') || color === null) && ((texture != null && texture instanceof HomeTexture) || texture === null) && cached === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_3 = Array.prototype.slice.call(arguments);
                var thickness_1 = __args_3[1];
                var height_1 = __args_3[0];
                var cached_1 = true;
                this.thickness = 0;
                this.height = 0;
                this.color = null;
                this.texture = null;
                this.thickness = 0;
                this.height = 0;
                this.color = null;
                this.texture = null;
                (function () {
                    _this.height = height_1;
                    _this.thickness = thickness_1;
                    _this.color = color;
                    _this.texture = texture;
                    if (cached_1) {
                        /* add */ Baseboard.baseboardsCache_$LI$().push(_this);
                    }
                })();
            }
        }
        else
            throw new Error('invalid overload');
    }
    Baseboard.baseboardsCache_$LI$ = function () { if (Baseboard.baseboardsCache == null)
        Baseboard.baseboardsCache = ([]); return Baseboard.baseboardsCache; };
    ;
    /**
     * Returns an instance of this class matching the given parameters.
     * @param {number} thickness
     * @param {number} height
     * @param {number} color
     * @param {HomeTexture} texture
     * @return {Baseboard}
     */
    Baseboard.getInstance = function (thickness, height, color, texture) {
        var baseboard = new Baseboard(thickness, height, color, texture, false);
        for (var i = Baseboard.baseboardsCache_$LI$().length - 1; i >= 0; i--) {
            var cachedBaseboard = Baseboard.baseboardsCache_$LI$()[i];
            if (cachedBaseboard == null) {
                /* remove */ Baseboard.baseboardsCache_$LI$().splice(i, 1);
            }
            else if ((function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(cachedBaseboard, baseboard)) {
                return baseboard;
            }
        }
        /* add */ Baseboard.baseboardsCache_$LI$().push(baseboard);
        return baseboard;
    };
    /**
     * Returns the thickness of this baseboard.
     * @return {number}
     */
    Baseboard.prototype.getThickness = function () {
        return this.thickness;
    };
    /**
     * Returns the height of this baseboard.
     * @return {number}
     */
    Baseboard.prototype.getHeight = function () {
        return this.height;
    };
    /**
     * Returns the color of this baseboard.
     * @return {number}
     */
    Baseboard.prototype.getColor = function () {
        return this.color;
    };
    /**
     * Returns the texture of this baseboard.
     * @return {HomeTexture}
     */
    Baseboard.prototype.getTexture = function () {
        return this.texture;
    };
    /**
     * Returns <code>true</code> if this baseboard is equal to <code>object</code>.
     * @param {*} object
     * @return {boolean}
     */
    Baseboard.prototype.equals = function (object) {
        if (object != null && object instanceof Baseboard) {
            var baseboard = object;
            return baseboard.thickness === this.thickness && baseboard.height === this.height && (baseboard.color === this.color || baseboard.color != null && (baseboard.color === this.color)) && (baseboard.texture === this.texture || baseboard.texture != null && (function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(baseboard.texture, this.texture));
        }
        return false;
    };
    return Baseboard;
}());
Baseboard["__class"] = "Baseboard";
Baseboard["__interfaces"] = ["java.io.Serializable"];
/**
 * A catalog piece of furniture.
 * @author Emmanuel Puybaret
 */
var CatalogPieceOfFurniture = (function () {
    function CatalogPieceOfFurniture(id, name, description, information, tags, creationDate, grade, icon, planIcon, model, width, depth, height, elevation, dropOnTopElevation, movable, doorOrWindow, staircaseCutOutShape, color, modelRotation, backFaceShown, creator, resizable, deformable, texturable, price, valueAddedTaxPercentage, currency, iconYaw, proportional, modifiable) {
        var _this = this;
        if (((typeof id === 'string') || id === null) && ((typeof name === 'string') || name === null) && ((typeof description === 'string') || description === null) && ((typeof information === 'string') || information === null) && ((tags != null && tags instanceof Array && (tags.length == 0 || tags[0] == null || (typeof tags[0] === 'string'))) || tags === null) && ((typeof creationDate === 'number') || creationDate === null) && ((typeof grade === 'number') || grade === null) && ((icon != null && (icon["__interfaces"] != null && icon["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || icon.constructor != null && icon.constructor["__interfaces"] != null && icon.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || icon === null) && ((planIcon != null && (planIcon["__interfaces"] != null && planIcon["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || planIcon.constructor != null && planIcon.constructor["__interfaces"] != null && planIcon.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || planIcon === null) && ((model != null && (model["__interfaces"] != null && model["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || model.constructor != null && model.constructor["__interfaces"] != null && model.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || model === null) && ((typeof width === 'number') || width === null) && ((typeof depth === 'number') || depth === null) && ((typeof height === 'number') || height === null) && ((typeof elevation === 'number') || elevation === null) && ((typeof dropOnTopElevation === 'number') || dropOnTopElevation === null) && ((typeof movable === 'boolean') || movable === null) && ((typeof doorOrWindow === 'boolean') || doorOrWindow === null) && ((typeof staircaseCutOutShape === 'string') || staircaseCutOutShape === null) && ((typeof color === 'number') || color === null) && ((modelRotation != null && modelRotation instanceof Array && (modelRotation.length == 0 || modelRotation[0] == null || modelRotation[0] instanceof Array)) || modelRotation === null) && ((typeof backFaceShown === 'boolean') || backFaceShown === null) && ((typeof creator === 'string') || creator === null) && ((typeof resizable === 'boolean') || resizable === null) && ((typeof deformable === 'boolean') || deformable === null) && ((typeof texturable === 'boolean') || texturable === null) && ((price != null && price instanceof Big) || price === null) && ((valueAddedTaxPercentage != null && valueAddedTaxPercentage instanceof Big) || valueAddedTaxPercentage === null) && ((typeof currency === 'string') || currency === null) && ((typeof iconYaw === 'number') || iconYaw === null) && ((typeof proportional === 'boolean') || proportional === null) && ((typeof modifiable === 'boolean') || modifiable === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.id = null;
            this.name = null;
            this.description = null;
            this.information = null;
            this.tags = null;
            this.creationDate = null;
            this.grade = null;
            this.icon = null;
            this.planIcon = null;
            this.model = null;
            this.width = 0;
            this.depth = 0;
            this.height = 0;
            this.proportional = false;
            this.elevation = 0;
            this.dropOnTopElevation = 0;
            this.movable = false;
            this.doorOrWindow = false;
            this.modelRotation = null;
            this.staircaseCutOutShape = null;
            this.creator = null;
            this.backFaceShown = false;
            this.color = null;
            this.iconYaw = 0;
            this.modifiable = false;
            this.resizable = false;
            this.deformable = false;
            this.texturable = false;
            this.price = null;
            this.valueAddedTaxPercentage = null;
            this.currency = null;
            this.category = null;
            this.filterCollationKey = null;
            this.id = null;
            this.name = null;
            this.description = null;
            this.information = null;
            this.tags = null;
            this.creationDate = null;
            this.grade = null;
            this.icon = null;
            this.planIcon = null;
            this.model = null;
            this.width = 0;
            this.depth = 0;
            this.height = 0;
            this.proportional = false;
            this.elevation = 0;
            this.dropOnTopElevation = 0;
            this.movable = false;
            this.doorOrWindow = false;
            this.modelRotation = null;
            this.staircaseCutOutShape = null;
            this.creator = null;
            this.backFaceShown = false;
            this.color = null;
            this.iconYaw = 0;
            this.modifiable = false;
            this.resizable = false;
            this.deformable = false;
            this.texturable = false;
            this.price = null;
            this.valueAddedTaxPercentage = null;
            this.currency = null;
            this.category = null;
            this.filterCollationKey = null;
            (function () {
                _this.id = id;
                _this.name = name;
                _this.description = description;
                _this.information = information;
                _this.tags = tags;
                _this.creationDate = creationDate;
                _this.grade = grade;
                _this.icon = icon;
                _this.planIcon = planIcon;
                _this.model = model;
                _this.width = width;
                _this.depth = depth;
                _this.height = height;
                _this.elevation = elevation;
                _this.dropOnTopElevation = dropOnTopElevation;
                _this.movable = movable;
                _this.doorOrWindow = doorOrWindow;
                _this.color = color;
                _this.staircaseCutOutShape = staircaseCutOutShape;
                _this.creator = creator;
                _this.price = price;
                _this.valueAddedTaxPercentage = valueAddedTaxPercentage;
                _this.currency = currency;
                if (modelRotation == null) {
                    _this.modelRotation = CatalogPieceOfFurniture.INDENTITY_ROTATION_$LI$();
                }
                else {
                    _this.modelRotation = _this.deepCopy(modelRotation);
                }
                _this.backFaceShown = backFaceShown;
                _this.resizable = resizable;
                _this.deformable = deformable;
                _this.texturable = texturable;
                _this.iconYaw = iconYaw;
                _this.proportional = proportional;
                _this.modifiable = modifiable;
            })();
        }
        else if (((typeof id === 'string') || id === null) && ((typeof name === 'string') || name === null) && ((typeof description === 'string') || description === null) && ((typeof information === 'string') || information === null) && ((tags != null && tags instanceof Array && (tags.length == 0 || tags[0] == null || (typeof tags[0] === 'string'))) || tags === null) && ((typeof creationDate === 'number') || creationDate === null) && ((typeof grade === 'number') || grade === null) && ((icon != null && (icon["__interfaces"] != null && icon["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || icon.constructor != null && icon.constructor["__interfaces"] != null && icon.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || icon === null) && ((planIcon != null && (planIcon["__interfaces"] != null && planIcon["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || planIcon.constructor != null && planIcon.constructor["__interfaces"] != null && planIcon.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || planIcon === null) && ((model != null && (model["__interfaces"] != null && model["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || model.constructor != null && model.constructor["__interfaces"] != null && model.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || model === null) && ((typeof width === 'number') || width === null) && ((typeof depth === 'number') || depth === null) && ((typeof height === 'number') || height === null) && ((typeof elevation === 'number') || elevation === null) && ((typeof dropOnTopElevation === 'number') || dropOnTopElevation === null) && ((typeof movable === 'boolean') || movable === null) && ((typeof doorOrWindow === 'string') || doorOrWindow === null) && ((staircaseCutOutShape != null && staircaseCutOutShape instanceof Array && (staircaseCutOutShape.length == 0 || staircaseCutOutShape[0] == null || staircaseCutOutShape[0] instanceof Array)) || staircaseCutOutShape === null) && ((typeof color === 'boolean') || color === null) && ((typeof modelRotation === 'string') || modelRotation === null) && ((typeof backFaceShown === 'boolean') || backFaceShown === null) && ((typeof creator === 'boolean') || creator === null) && ((typeof resizable === 'boolean') || resizable === null) && ((deformable != null && deformable instanceof Big) || deformable === null) && ((texturable != null && texturable instanceof Big) || texturable === null) && ((typeof price === 'string') || price === null) && valueAddedTaxPercentage === undefined && currency === undefined && iconYaw === undefined && proportional === undefined && modifiable === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var staircaseCutOutShape_1 = __args[16];
            var modelRotation_1 = __args[17];
            var backFaceShown_1 = __args[18];
            var creator_1 = __args[19];
            var resizable_1 = __args[20];
            var deformable_1 = __args[21];
            var texturable_1 = __args[22];
            var price_1 = __args[23];
            var valueAddedTaxPercentage_1 = __args[24];
            var currency_1 = __args[25];
            {
                var __args_4 = Array.prototype.slice.call(arguments);
                var doorOrWindow_1 = false;
                var color_1 = null;
                var iconYaw_1 = (Math.fround ? (Math.PI) : Math.fround(Math.PI)) / 8;
                var proportional_1 = true;
                var modifiable_1 = false;
                this.id = null;
                this.name = null;
                this.description = null;
                this.information = null;
                this.tags = null;
                this.creationDate = null;
                this.grade = null;
                this.icon = null;
                this.planIcon = null;
                this.model = null;
                this.width = 0;
                this.depth = 0;
                this.height = 0;
                this.proportional = false;
                this.elevation = 0;
                this.dropOnTopElevation = 0;
                this.movable = false;
                this.doorOrWindow = false;
                this.modelRotation = null;
                this.staircaseCutOutShape = null;
                this.creator = null;
                this.backFaceShown = false;
                this.color = null;
                this.iconYaw = 0;
                this.modifiable = false;
                this.resizable = false;
                this.deformable = false;
                this.texturable = false;
                this.price = null;
                this.valueAddedTaxPercentage = null;
                this.currency = null;
                this.category = null;
                this.filterCollationKey = null;
                this.id = null;
                this.name = null;
                this.description = null;
                this.information = null;
                this.tags = null;
                this.creationDate = null;
                this.grade = null;
                this.icon = null;
                this.planIcon = null;
                this.model = null;
                this.width = 0;
                this.depth = 0;
                this.height = 0;
                this.proportional = false;
                this.elevation = 0;
                this.dropOnTopElevation = 0;
                this.movable = false;
                this.doorOrWindow = false;
                this.modelRotation = null;
                this.staircaseCutOutShape = null;
                this.creator = null;
                this.backFaceShown = false;
                this.color = null;
                this.iconYaw = 0;
                this.modifiable = false;
                this.resizable = false;
                this.deformable = false;
                this.texturable = false;
                this.price = null;
                this.valueAddedTaxPercentage = null;
                this.currency = null;
                this.category = null;
                this.filterCollationKey = null;
                (function () {
                    _this.id = id;
                    _this.name = name;
                    _this.description = description;
                    _this.information = information;
                    _this.tags = tags;
                    _this.creationDate = creationDate;
                    _this.grade = grade;
                    _this.icon = icon;
                    _this.planIcon = planIcon;
                    _this.model = model;
                    _this.width = width;
                    _this.depth = depth;
                    _this.height = height;
                    _this.elevation = elevation;
                    _this.dropOnTopElevation = dropOnTopElevation;
                    _this.movable = movable;
                    _this.doorOrWindow = doorOrWindow_1;
                    _this.color = color_1;
                    _this.staircaseCutOutShape = staircaseCutOutShape_1;
                    _this.creator = creator_1;
                    _this.price = price_1;
                    _this.valueAddedTaxPercentage = valueAddedTaxPercentage_1;
                    _this.currency = currency_1;
                    if (modelRotation_1 == null) {
                        _this.modelRotation = CatalogPieceOfFurniture.INDENTITY_ROTATION_$LI$();
                    }
                    else {
                        _this.modelRotation = _this.deepCopy(modelRotation_1);
                    }
                    _this.backFaceShown = backFaceShown_1;
                    _this.resizable = resizable_1;
                    _this.deformable = deformable_1;
                    _this.texturable = texturable_1;
                    _this.iconYaw = iconYaw_1;
                    _this.proportional = proportional_1;
                    _this.modifiable = modifiable_1;
                })();
            }
        }
        else if (((typeof id === 'string') || id === null) && ((name != null && (name["__interfaces"] != null && name["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || name.constructor != null && name.constructor["__interfaces"] != null && name.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || name === null) && ((description != null && (description["__interfaces"] != null && description["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || description.constructor != null && description.constructor["__interfaces"] != null && description.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || description === null) && ((typeof information === 'number') || information === null) && ((typeof tags === 'number') || tags === null) && ((typeof creationDate === 'number') || creationDate === null) && ((typeof grade === 'number') || grade === null) && ((typeof icon === 'boolean') || icon === null) && ((typeof planIcon === 'string') || planIcon === null) && ((typeof model === 'number') || model === null) && ((width != null && width instanceof Array && (width.length == 0 || width[0] == null || width[0] instanceof Array)) || width === null) && ((typeof depth === 'boolean') || depth === null) && ((typeof height === 'number') || height === null) && ((typeof elevation === 'boolean') || elevation === null) && dropOnTopElevation === undefined && movable === undefined && doorOrWindow === undefined && staircaseCutOutShape === undefined && color === undefined && modelRotation === undefined && backFaceShown === undefined && creator === undefined && resizable === undefined && deformable === undefined && texturable === undefined && price === undefined && valueAddedTaxPercentage === undefined && currency === undefined && iconYaw === undefined && proportional === undefined && modifiable === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var name_1 = __args[0];
            var icon_1 = __args[1];
            var model_1 = __args[2];
            var width_1 = __args[3];
            var depth_1 = __args[4];
            var height_2 = __args[5];
            var elevation_1 = __args[6];
            var movable_1 = __args[7];
            var staircaseCutOutShape_2 = __args[8];
            var color_2 = __args[9];
            var modelRotation_2 = __args[10];
            var backFaceShown_2 = __args[11];
            var iconYaw_2 = __args[12];
            var proportional_2 = __args[13];
            {
                var __args_5 = Array.prototype.slice.call(arguments);
                var id_1 = null;
                var description_1 = null;
                var information_1 = null;
                var tags_1 = new Array(0);
                var creationDate_1 = Date.now();
                var grade_1 = null;
                var planIcon_1 = null;
                var dropOnTopElevation_1 = 1.0;
                var doorOrWindow_2 = false;
                var creator_2 = null;
                var resizable_2 = true;
                var deformable_2 = true;
                var texturable_2 = true;
                var price_2 = null;
                var valueAddedTaxPercentage_2 = null;
                var currency_2 = null;
                var modifiable_2 = true;
                this.id = null;
                this.name = null;
                this.description = null;
                this.information = null;
                this.tags = null;
                this.creationDate = null;
                this.grade = null;
                this.icon = null;
                this.planIcon = null;
                this.model = null;
                this.width = 0;
                this.depth = 0;
                this.height = 0;
                this.proportional = false;
                this.elevation = 0;
                this.dropOnTopElevation = 0;
                this.movable = false;
                this.doorOrWindow = false;
                this.modelRotation = null;
                this.staircaseCutOutShape = null;
                this.creator = null;
                this.backFaceShown = false;
                this.color = null;
                this.iconYaw = 0;
                this.modifiable = false;
                this.resizable = false;
                this.deformable = false;
                this.texturable = false;
                this.price = null;
                this.valueAddedTaxPercentage = null;
                this.currency = null;
                this.category = null;
                this.filterCollationKey = null;
                this.id = null;
                this.name = null;
                this.description = null;
                this.information = null;
                this.tags = null;
                this.creationDate = null;
                this.grade = null;
                this.icon = null;
                this.planIcon = null;
                this.model = null;
                this.width = 0;
                this.depth = 0;
                this.height = 0;
                this.proportional = false;
                this.elevation = 0;
                this.dropOnTopElevation = 0;
                this.movable = false;
                this.doorOrWindow = false;
                this.modelRotation = null;
                this.staircaseCutOutShape = null;
                this.creator = null;
                this.backFaceShown = false;
                this.color = null;
                this.iconYaw = 0;
                this.modifiable = false;
                this.resizable = false;
                this.deformable = false;
                this.texturable = false;
                this.price = null;
                this.valueAddedTaxPercentage = null;
                this.currency = null;
                this.category = null;
                this.filterCollationKey = null;
                (function () {
                    _this.id = id_1;
                    _this.name = name_1;
                    _this.description = description_1;
                    _this.information = information_1;
                    _this.tags = tags_1;
                    _this.creationDate = creationDate_1;
                    _this.grade = grade_1;
                    _this.icon = icon_1;
                    _this.planIcon = planIcon_1;
                    _this.model = model_1;
                    _this.width = width_1;
                    _this.depth = depth_1;
                    _this.height = height_2;
                    _this.elevation = elevation_1;
                    _this.dropOnTopElevation = dropOnTopElevation_1;
                    _this.movable = movable_1;
                    _this.doorOrWindow = doorOrWindow_2;
                    _this.color = color_2;
                    _this.staircaseCutOutShape = staircaseCutOutShape_2;
                    _this.creator = creator_2;
                    _this.price = price_2;
                    _this.valueAddedTaxPercentage = valueAddedTaxPercentage_2;
                    _this.currency = currency_2;
                    if (modelRotation_2 == null) {
                        _this.modelRotation = CatalogPieceOfFurniture.INDENTITY_ROTATION_$LI$();
                    }
                    else {
                        _this.modelRotation = _this.deepCopy(modelRotation_2);
                    }
                    _this.backFaceShown = backFaceShown_2;
                    _this.resizable = resizable_2;
                    _this.deformable = deformable_2;
                    _this.texturable = texturable_2;
                    _this.iconYaw = iconYaw_2;
                    _this.proportional = proportional_2;
                    _this.modifiable = modifiable_2;
                })();
            }
        }
        else
            throw new Error('invalid overload');
    }
    CatalogPieceOfFurniture.__static_initialize = function () { if (!CatalogPieceOfFurniture.__static_initialized) {
        CatalogPieceOfFurniture.__static_initialized = true;
        CatalogPieceOfFurniture.__static_initializer_0();
    } };
    CatalogPieceOfFurniture.INDENTITY_ROTATION_$LI$ = function () { CatalogPieceOfFurniture.__static_initialize(); if (CatalogPieceOfFurniture.INDENTITY_ROTATION == null)
        CatalogPieceOfFurniture.INDENTITY_ROTATION = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; return CatalogPieceOfFurniture.INDENTITY_ROTATION; };
    ;
    CatalogPieceOfFurniture.EMPTY_CRITERIA_$LI$ = function () { CatalogPieceOfFurniture.__static_initialize(); if (CatalogPieceOfFurniture.EMPTY_CRITERIA == null)
        CatalogPieceOfFurniture.EMPTY_CRITERIA = new Array(0); return CatalogPieceOfFurniture.EMPTY_CRITERIA; };
    ;
    CatalogPieceOfFurniture.COMPARATOR_$LI$ = function () { CatalogPieceOfFurniture.__static_initialize(); return CatalogPieceOfFurniture.COMPARATOR; };
    ;
    CatalogPieceOfFurniture.recentFilters_$LI$ = function () { CatalogPieceOfFurniture.__static_initialize(); return CatalogPieceOfFurniture.recentFilters; };
    ;
    CatalogPieceOfFurniture.__static_initializer_0 = function () {
        CatalogPieceOfFurniture.COMPARATOR = (function (o1, o2) { return o1.toString().localeCompare(o2.toString()); });
        /* setStrength */ CatalogPieceOfFurniture.COMPARATOR_$LI$();
        CatalogPieceOfFurniture.recentFilters = ({});
    };
    /**
     * Returns the ID of this piece of furniture or <code>null</code>.
     * @return {string}
     */
    CatalogPieceOfFurniture.prototype.getId = function () {
        return this.id;
    };
    /**
     * Returns the name of this piece of furniture.
     * @return {string}
     */
    CatalogPieceOfFurniture.prototype.getName = function () {
        return this.name;
    };
    /**
     * Returns the description of this piece of furniture.
     * The returned value may be <code>null</code>.
     * @return {string}
     */
    CatalogPieceOfFurniture.prototype.getDescription = function () {
        return this.description;
    };
    /**
     * Returns the additional information associated to this piece, or <code>null</code>.
     * @since 3.6
     * @return {string}
     */
    CatalogPieceOfFurniture.prototype.getInformation = function () {
        return this.information;
    };
    /**
     * Returns the tags associated to this piece.
     * @since 3.6
     * @return {Array}
     */
    CatalogPieceOfFurniture.prototype.getTags = function () {
        return this.tags;
    };
    /**
     * Returns the creation date of this piece in milliseconds since the epoch,
     * or <code>null</code> if no date is given to this piece.
     * @since 3.6
     * @return {number}
     */
    CatalogPieceOfFurniture.prototype.getCreationDate = function () {
        return this.creationDate;
    };
    /**
     * Returns the grade of this piece, or <code>null</code> if no grade is given to this piece.
     * @since 3.6
     * @return {number}
     */
    CatalogPieceOfFurniture.prototype.getGrade = function () {
        return this.grade;
    };
    /**
     * Returns the depth of this piece of furniture.
     * @return {number}
     */
    CatalogPieceOfFurniture.prototype.getDepth = function () {
        return this.depth;
    };
    /**
     * Returns the height of this piece of furniture.
     * @return {number}
     */
    CatalogPieceOfFurniture.prototype.getHeight = function () {
        return this.height;
    };
    /**
     * Returns the width of this piece of furniture.
     * @return {number}
     */
    CatalogPieceOfFurniture.prototype.getWidth = function () {
        return this.width;
    };
    /**
     * Returns the elevation of this piece of furniture.
     * @return {number}
     */
    CatalogPieceOfFurniture.prototype.getElevation = function () {
        return this.elevation;
    };
    /**
     * Returns the elevation at which should be placed an object dropped on this piece.
     * @return {number} a percentage of the height of this piece. A negative value means that the piece
     * should be ignored when an object is dropped on it.
     * @since 4.4
     */
    CatalogPieceOfFurniture.prototype.getDropOnTopElevation = function () {
        return this.dropOnTopElevation;
    };
    /**
     * Returns <code>true</code> if this piece of furniture is movable.
     * @return {boolean}
     */
    CatalogPieceOfFurniture.prototype.isMovable = function () {
        return this.movable;
    };
    /**
     * Returns <code>true</code> if this piece of furniture is a door or a window.
     * As this method existed before {@linkplain CatalogDoorOrWindow CatalogDoorOrWindow} class,
     * you shouldn't rely on the value returned by this method to guess if a piece
     * is an instance of <code>DoorOrWindow</code> class.
     * @return {boolean}
     */
    CatalogPieceOfFurniture.prototype.isDoorOrWindow = function () {
        return this.doorOrWindow;
    };
    /**
     * Returns the icon of this piece of furniture.
     * @return {Content}
     */
    CatalogPieceOfFurniture.prototype.getIcon = function () {
        return this.icon;
    };
    /**
     * Returns the icon of this piece of furniture displayed in plan or <code>null</code>.
     * @since 2.2
     * @return {Content}
     */
    CatalogPieceOfFurniture.prototype.getPlanIcon = function () {
        return this.planIcon;
    };
    /**
     * Returns the 3D model of this piece of furniture.
     * @return {Content}
     */
    CatalogPieceOfFurniture.prototype.getModel = function () {
        return this.model;
    };
    /**
     * Returns the rotation 3 by 3 matrix of this piece of furniture that ensures
     * its model is correctly oriented.
     * @return {Array}
     */
    CatalogPieceOfFurniture.prototype.getModelRotation = function () {
        return this.deepCopy(this.modelRotation);
    };
    CatalogPieceOfFurniture.prototype.deepCopy = function (modelRotation) {
        return [[modelRotation[0][0], modelRotation[0][1], modelRotation[0][2]], [modelRotation[1][0], modelRotation[1][1], modelRotation[1][2]], [modelRotation[2][0], modelRotation[2][1], modelRotation[2][2]]];
    };
    /**
     * Returns the shape used to cut out upper levels when they intersect with the piece
     * like a staircase.
     * @since 3.4
     * @return {string}
     */
    CatalogPieceOfFurniture.prototype.getStaircaseCutOutShape = function () {
        return this.staircaseCutOutShape;
    };
    /**
     * Returns the creator of this piece.
     * @return {string}
     */
    CatalogPieceOfFurniture.prototype.getCreator = function () {
        return this.creator;
    };
    /**
     * Returns <code>true</code> if the back face of the piece of furniture
     * model should be displayed.
     * @return {boolean}
     */
    CatalogPieceOfFurniture.prototype.isBackFaceShown = function () {
        return this.backFaceShown;
    };
    /**
     * Returns the color of this piece of furniture.
     * @return {number}
     */
    CatalogPieceOfFurniture.prototype.getColor = function () {
        return this.color;
    };
    /**
     * Returns the yaw angle used to create the piece icon.
     * @return {number}
     */
    CatalogPieceOfFurniture.prototype.getIconYaw = function () {
        return this.iconYaw;
    };
    /**
     * Returns <code>true</code> if size proportions should be kept.
     * @return {boolean}
     */
    CatalogPieceOfFurniture.prototype.isProportional = function () {
        return this.proportional;
    };
    /**
     * Returns <code>true</code> if this piece is modifiable (not read from resources).
     * @return {boolean}
     */
    CatalogPieceOfFurniture.prototype.isModifiable = function () {
        return this.modifiable;
    };
    /**
     * Returns <code>true</code> if this piece is resizable.
     * @return {boolean}
     */
    CatalogPieceOfFurniture.prototype.isResizable = function () {
        return this.resizable;
    };
    /**
     * Returns <code>true</code> if this piece is deformable.
     * @since 3.0
     * @return {boolean}
     */
    CatalogPieceOfFurniture.prototype.isDeformable = function () {
        return this.deformable;
    };
    /**
     * Returns <code>false</code> if this piece should always keep the same color or texture.
     * @since 3.0
     * @return {boolean}
     */
    CatalogPieceOfFurniture.prototype.isTexturable = function () {
        return this.texturable;
    };
    /**
     * Returns the price of this piece of furniture or <code>null</code>.
     * @return {Big}
     */
    CatalogPieceOfFurniture.prototype.getPrice = function () {
        return this.price;
    };
    /**
     * Returns the Value Added Tax percentage applied to the price of this piece of furniture.
     * @return {Big}
     */
    CatalogPieceOfFurniture.prototype.getValueAddedTaxPercentage = function () {
        return this.valueAddedTaxPercentage;
    };
    /**
     * Returns the price currency, noted with ISO 4217 code, or <code>null</code>
     * if it has no price or default currency should be used.
     * @since 3.4
     * @return {string}
     */
    CatalogPieceOfFurniture.prototype.getCurrency = function () {
        return this.currency;
    };
    /**
     * Returns the category of this piece of furniture.
     * @return {FurnitureCategory}
     */
    CatalogPieceOfFurniture.prototype.getCategory = function () {
        return this.category;
    };
    /**
     * Sets the category of this piece of furniture.
     * @param {FurnitureCategory} category
     */
    CatalogPieceOfFurniture.prototype.setCategory = function (category) {
        this.category = category;
    };
    /**
     *
     * Returns <code>true</code> if this piece and the one in parameter are the same objects.
     * Note that, from version 3.6, two pieces of furniture can have the same name.
     * @param {*} obj
     * @return {boolean}
     */
    CatalogPieceOfFurniture.prototype.equals = function (obj) {
        return (this === obj);
    };
    /**
     *
     * Compares the names of this piece and the one in parameter.
     * @param {CatalogPieceOfFurniture} piece
     * @return {number}
     */
    CatalogPieceOfFurniture.prototype.compareTo = function (piece) {
        var nameComparison = CatalogPieceOfFurniture.COMPARATOR_$LI$().compare(this.name, piece.name);
        if (nameComparison !== 0) {
            return nameComparison;
        }
        else {
            return this.modifiable === piece.modifiable ? 0 : (this.modifiable ? 1 : -1);
        }
    };
    /**
     * Returns <code>true</code> if this piece matches the given <code>filter</code> text.
     * Each substring of the <code>filter</code> is considered as a search criterion that can match
     * the name, the category name, the creator, the description or the tags of this piece.
     * @since 4.2
     * @param {string} filter
     * @return {boolean}
     */
    CatalogPieceOfFurniture.prototype.matchesFilter = function (filter) {
        var filterCriteriaCollationKeys = this.getFilterCollationKeys(filter);
        var checkedCriteria = 0;
        if (filterCriteriaCollationKeys.length > 0) {
            var furnitureCollationKey = this.getPieceOfFurnitureCollationKey();
            for (var i = 0; i < filterCriteriaCollationKeys.length; i++) {
                if (this.isSubCollationKey(furnitureCollationKey, filterCriteriaCollationKeys[i], 0)) {
                    checkedCriteria++;
                }
                else {
                    break;
                }
            }
        }
        return checkedCriteria === filterCriteriaCollationKeys.length;
    };
    /**
     * Returns the collation key bytes of each criterion in the given <code>filter</code>.
     * @param {string} filter
     * @return {Array}
     * @private
     */
    CatalogPieceOfFurniture.prototype.getFilterCollationKeys = function (filter) {
        if (filter.length === 0) {
            return CatalogPieceOfFurniture.EMPTY_CRITERIA_$LI$();
        }
        var filterCollationKeys = (function (m, k) { return m[k] ? m[k] : null; })(CatalogPieceOfFurniture.recentFilters_$LI$(), filter);
        if (filterCollationKeys == null) {
            var filterCriteria = filter.split("\\s|\\p{Punct}|\\|");
            var filterCriteriaCollationKeys = ([]);
            for (var index127 = 0; index127 < filterCriteria.length; index127++) {
                var criterion = filterCriteria[index127];
                {
                    if (criterion.length > 0) {
                        /* add */ filterCriteriaCollationKeys.push(CatalogPieceOfFurniture.COMPARATOR_$LI$().getCollationKey(criterion).toByteArray());
                    }
                }
            }
            if (filterCriteriaCollationKeys.length === 0) {
                filterCollationKeys = CatalogPieceOfFurniture.EMPTY_CRITERIA_$LI$();
            }
            else {
                filterCollationKeys = filterCriteriaCollationKeys.slice(0);
            }
            /* put */ (CatalogPieceOfFurniture.recentFilters_$LI$()[filter] = filterCollationKeys);
        }
        return filterCollationKeys;
    };
    /**
     * Returns the collation key bytes used to compare the given <code>piece</code> with filter.
     * @return {Array}
     * @private
     */
    CatalogPieceOfFurniture.prototype.getPieceOfFurnitureCollationKey = function () {
        var _this = this;
        if (this.filterCollationKey == null) {
            var search = { str: "", toString: function () { return this.str; } };
            /* append */ (function (sb) { return sb.str = sb.str.concat(_this.getName()); })(search);
            /* append */ (function (sb) { return sb.str = sb.str.concat('|'); })(search);
            if (this.getCategory() != null) {
                /* append */ (function (sb) { return sb.str = sb.str.concat(_this.getCategory().getName()); })(search);
                /* append */ (function (sb) { return sb.str = sb.str.concat('|'); })(search);
            }
            if (this.getCreator() != null) {
                /* append */ (function (sb) { return sb.str = sb.str.concat(_this.getCreator()); })(search);
                /* append */ (function (sb) { return sb.str = sb.str.concat('|'); })(search);
            }
            if (this.getDescription() != null) {
                /* append */ (function (sb) { return sb.str = sb.str.concat(_this.getDescription()); })(search);
                /* append */ (function (sb) { return sb.str = sb.str.concat('|'); })(search);
            }
            {
                var array129 = this.getTags();
                var _loop_1 = function (index128) {
                    var tag = array129[index128];
                    {
                        /* append */ (function (sb) { return sb.str = sb.str.concat(tag); })(search);
                        /* append */ (function (sb) { return sb.str = sb.str.concat('|'); })(search);
                    }
                };
                for (var index128 = 0; index128 < array129.length; index128++) {
                    _loop_1(index128);
                }
            }
            this.filterCollationKey = CatalogPieceOfFurniture.COMPARATOR_$LI$().getCollationKey(/* toString */ search.str).toByteArray();
        }
        return this.filterCollationKey;
    };
    /**
     * Returns <code>true</code> if the given filter collation key is a sub part of the first array collator key.
     * @param {Array} collationKey
     * @param {Array} filterCollationKey
     * @param {number} start
     * @return {boolean}
     * @private
     */
    CatalogPieceOfFurniture.prototype.isSubCollationKey = function (collationKey, filterCollationKey, start) {
        for (var i = start, n = collationKey.length - 4, m = filterCollationKey.length - 4; i < n && i < n - m + 1; i++) {
            if (collationKey[i] === filterCollationKey[0]) {
                for (var j = 1; j < m; j++) {
                    if (collationKey[i + j] !== filterCollationKey[j]) {
                        return this.isSubCollationKey(collationKey, filterCollationKey, i + 1);
                    }
                }
                return true;
            }
        }
        return false;
    };
    return CatalogPieceOfFurniture;
}());
CatalogPieceOfFurniture.__static_initialized = false;
CatalogPieceOfFurniture["__class"] = "CatalogPieceOfFurniture";
CatalogPieceOfFurniture["__interfaces"] = ["com.eteks.sweethome3d.model.CatalogItem", "com.eteks.sweethome3d.model.PieceOfFurniture", "java.lang.Comparable"];
/**
 * A texture in textures catalog.
 * @author Emmanuel Puybaret
 */
var CatalogTexture = (function () {
    function CatalogTexture(id, name, image, width, height, creator, modifiable) {
        var _this = this;
        if (((typeof id === 'string') || id === null) && ((typeof name === 'string') || name === null) && ((image != null && (image["__interfaces"] != null && image["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || image.constructor != null && image.constructor["__interfaces"] != null && image.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || image === null) && ((typeof width === 'number') || width === null) && ((typeof height === 'number') || height === null) && ((typeof creator === 'string') || creator === null) && ((typeof modifiable === 'boolean') || modifiable === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.id = null;
            this.name = null;
            this.image = null;
            this.width = 0;
            this.height = 0;
            this.creator = null;
            this.modifiable = false;
            this.category = null;
            this.filterCollationKey = null;
            this.id = null;
            this.name = null;
            this.image = null;
            this.width = 0;
            this.height = 0;
            this.creator = null;
            this.modifiable = false;
            this.category = null;
            this.filterCollationKey = null;
            (function () {
                _this.id = id;
                _this.name = name;
                _this.image = image;
                _this.width = width;
                _this.height = height;
                _this.creator = creator;
                _this.modifiable = modifiable;
            })();
        }
        else if (((typeof id === 'string') || id === null) && ((typeof name === 'string') || name === null) && ((image != null && (image["__interfaces"] != null && image["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || image.constructor != null && image.constructor["__interfaces"] != null && image.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || image === null) && ((typeof width === 'number') || width === null) && ((typeof height === 'number') || height === null) && ((typeof creator === 'string') || creator === null) && modifiable === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_6 = Array.prototype.slice.call(arguments);
                var modifiable_3 = false;
                this.id = null;
                this.name = null;
                this.image = null;
                this.width = 0;
                this.height = 0;
                this.creator = null;
                this.modifiable = false;
                this.category = null;
                this.filterCollationKey = null;
                this.id = null;
                this.name = null;
                this.image = null;
                this.width = 0;
                this.height = 0;
                this.creator = null;
                this.modifiable = false;
                this.category = null;
                this.filterCollationKey = null;
                (function () {
                    _this.id = id;
                    _this.name = name;
                    _this.image = image;
                    _this.width = width;
                    _this.height = height;
                    _this.creator = creator;
                    _this.modifiable = modifiable_3;
                })();
            }
        }
        else if (((typeof id === 'string') || id === null) && ((name != null && (name["__interfaces"] != null && name["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || name.constructor != null && name.constructor["__interfaces"] != null && name.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || name === null) && ((typeof image === 'number') || image === null) && ((typeof width === 'number') || width === null) && ((typeof height === 'boolean') || height === null) && creator === undefined && modifiable === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var name_2 = __args[0];
            var image_1 = __args[1];
            var width_2 = __args[2];
            var height_3 = __args[3];
            var modifiable_4 = __args[4];
            {
                var __args_7 = Array.prototype.slice.call(arguments);
                var id_2 = null;
                var creator_3 = null;
                this.id = null;
                this.name = null;
                this.image = null;
                this.width = 0;
                this.height = 0;
                this.creator = null;
                this.modifiable = false;
                this.category = null;
                this.filterCollationKey = null;
                this.id = null;
                this.name = null;
                this.image = null;
                this.width = 0;
                this.height = 0;
                this.creator = null;
                this.modifiable = false;
                this.category = null;
                this.filterCollationKey = null;
                (function () {
                    _this.id = id_2;
                    _this.name = name_2;
                    _this.image = image_1;
                    _this.width = width_2;
                    _this.height = height_3;
                    _this.creator = creator_3;
                    _this.modifiable = modifiable_4;
                })();
            }
        }
        else if (((typeof id === 'string') || id === null) && ((name != null && (name["__interfaces"] != null && name["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || name.constructor != null && name.constructor["__interfaces"] != null && name.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || name === null) && ((typeof image === 'number') || image === null) && ((typeof width === 'number') || width === null) && height === undefined && creator === undefined && modifiable === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var name_3 = __args[0];
            var image_2 = __args[1];
            var width_3 = __args[2];
            var height_4 = __args[3];
            {
                var __args_8 = Array.prototype.slice.call(arguments);
                var id_3 = null;
                var creator_4 = null;
                {
                    var __args_9 = Array.prototype.slice.call(arguments);
                    var modifiable_5 = false;
                    this.id = null;
                    this.name = null;
                    this.image = null;
                    this.width = 0;
                    this.height = 0;
                    this.creator = null;
                    this.modifiable = false;
                    this.category = null;
                    this.filterCollationKey = null;
                    this.id = null;
                    this.name = null;
                    this.image = null;
                    this.width = 0;
                    this.height = 0;
                    this.creator = null;
                    this.modifiable = false;
                    this.category = null;
                    this.filterCollationKey = null;
                    (function () {
                        _this.id = id_3;
                        _this.name = name_3;
                        _this.image = image_2;
                        _this.width = width_3;
                        _this.height = height_4;
                        _this.creator = creator_4;
                        _this.modifiable = modifiable_5;
                    })();
                }
            }
        }
        else
            throw new Error('invalid overload');
    }
    CatalogTexture.__static_initialize = function () { if (!CatalogTexture.__static_initialized) {
        CatalogTexture.__static_initialized = true;
        CatalogTexture.__static_initializer_0();
    } };
    CatalogTexture.EMPTY_CRITERIA_$LI$ = function () { CatalogTexture.__static_initialize(); if (CatalogTexture.EMPTY_CRITERIA == null)
        CatalogTexture.EMPTY_CRITERIA = new Array(0); return CatalogTexture.EMPTY_CRITERIA; };
    ;
    CatalogTexture.COMPARATOR_$LI$ = function () { CatalogTexture.__static_initialize(); return CatalogTexture.COMPARATOR; };
    ;
    CatalogTexture.recentFilters_$LI$ = function () { CatalogTexture.__static_initialize(); return CatalogTexture.recentFilters; };
    ;
    CatalogTexture.__static_initializer_0 = function () {
        CatalogTexture.COMPARATOR = (function (o1, o2) { return o1.toString().localeCompare(o2.toString()); });
        /* setStrength */ CatalogTexture.COMPARATOR_$LI$();
        CatalogTexture.recentFilters = ({});
    };
    /**
     * Returns the ID of this texture or <code>null</code>.
     * @since 2.3
     * @return {string}
     */
    CatalogTexture.prototype.getId = function () {
        return this.id;
    };
    /**
     * Returns the name of this texture.
     * @return {string}
     */
    CatalogTexture.prototype.getName = function () {
        return this.name;
    };
    /**
     * Returns the content of the image used for this texture.
     * @return {Content}
     */
    CatalogTexture.prototype.getImage = function () {
        return this.image;
    };
    /**
     * Returns the icon of this texture.
     * @return {Content} the image of this texture.
     * @since 4.4
     */
    CatalogTexture.prototype.getIcon = function () {
        return this.getImage();
    };
    /**
     * Returns the width of the image in centimeters.
     * @return {number}
     */
    CatalogTexture.prototype.getWidth = function () {
        return this.width;
    };
    /**
     * Returns the height of the image in centimeters.
     * @return {number}
     */
    CatalogTexture.prototype.getHeight = function () {
        return this.height;
    };
    /**
     * Returns the creator of this texture or <code>null</code>.
     * @since 2.3
     * @return {string}
     */
    CatalogTexture.prototype.getCreator = function () {
        return this.creator;
    };
    /**
     * Returns <code>true</code> if this texture is modifiable (not read from resources).
     * @return {boolean}
     */
    CatalogTexture.prototype.isModifiable = function () {
        return this.modifiable;
    };
    /**
     * Returns the category of this texture.
     * @return {TexturesCategory}
     */
    CatalogTexture.prototype.getCategory = function () {
        return this.category;
    };
    /**
     * Sets the category of this texture.
     * @param {TexturesCategory} category
     */
    CatalogTexture.prototype.setCategory = function (category) {
        this.category = category;
    };
    /**
     *
     * Returns true if this texture and the one in parameter are the same objects.
     * Note that, from version 3.6, two textures can have the same name.
     * @param {*} obj
     * @return {boolean}
     */
    CatalogTexture.prototype.equals = function (obj) {
        return (this === obj);
    };
    /**
     *
     * Compares the names of this texture and the one in parameter.
     * @param {CatalogTexture} texture
     * @return {number}
     */
    CatalogTexture.prototype.compareTo = function (texture) {
        var nameComparison = CatalogTexture.COMPARATOR_$LI$().compare(this.name, texture.name);
        if (nameComparison !== 0) {
            return nameComparison;
        }
        else {
            return this.modifiable === texture.modifiable ? 0 : (this.modifiable ? 1 : -1);
        }
    };
    /**
     * Returns <code>true</code> if this texture matches the given <code>filter</code> text.
     * Each substring of the <code>filter</code> is considered as a search criterion that can match
     * the name, the category name or the creator of this texture.
     * @since 4.4
     * @param {string} filter
     * @return {boolean}
     */
    CatalogTexture.prototype.matchesFilter = function (filter) {
        var filterCriteriaCollationKeys = this.getFilterCollationKeys(filter);
        var checkedCriteria = 0;
        if (filterCriteriaCollationKeys.length > 0) {
            var furnitureCollationKey = this.getTextureCollationKey();
            for (var i = 0; i < filterCriteriaCollationKeys.length; i++) {
                if (this.isSubCollationKey(furnitureCollationKey, filterCriteriaCollationKeys[i], 0)) {
                    checkedCriteria++;
                }
                else {
                    break;
                }
            }
        }
        return checkedCriteria === filterCriteriaCollationKeys.length;
    };
    /**
     * Returns the collation key bytes of each criterion in the given <code>filter</code>.
     * @param {string} filter
     * @return {Array}
     * @private
     */
    CatalogTexture.prototype.getFilterCollationKeys = function (filter) {
        if (filter.length === 0) {
            return CatalogTexture.EMPTY_CRITERIA_$LI$();
        }
        var filterCollationKeys = (function (m, k) { return m[k] ? m[k] : null; })(CatalogTexture.recentFilters_$LI$(), filter);
        if (filterCollationKeys == null) {
            var filterCriteria = filter.split("\\s|\\p{Punct}|\\|");
            var filterCriteriaCollationKeys = ([]);
            for (var index130 = 0; index130 < filterCriteria.length; index130++) {
                var criterion = filterCriteria[index130];
                {
                    if (criterion.length > 0) {
                        /* add */ filterCriteriaCollationKeys.push(CatalogTexture.COMPARATOR_$LI$().getCollationKey(criterion).toByteArray());
                    }
                }
            }
            if (filterCriteriaCollationKeys.length === 0) {
                filterCollationKeys = CatalogTexture.EMPTY_CRITERIA_$LI$();
            }
            else {
                filterCollationKeys = filterCriteriaCollationKeys.slice(0);
            }
            /* put */ (CatalogTexture.recentFilters_$LI$()[filter] = filterCollationKeys);
        }
        return filterCollationKeys;
    };
    /**
     * Returns the collation key bytes used to compare the given <code>texture</code> with filter.
     * @return {Array}
     * @private
     */
    CatalogTexture.prototype.getTextureCollationKey = function () {
        var _this = this;
        if (this.filterCollationKey == null) {
            var search = { str: "", toString: function () { return this.str; } };
            /* append */ (function (sb) { return sb.str = sb.str.concat(_this.getName()); })(search);
            /* append */ (function (sb) { return sb.str = sb.str.concat('|'); })(search);
            if (this.getCategory() != null) {
                /* append */ (function (sb) { return sb.str = sb.str.concat(_this.getCategory().getName()); })(search);
                /* append */ (function (sb) { return sb.str = sb.str.concat('|'); })(search);
            }
            if (this.getCreator() != null) {
                /* append */ (function (sb) { return sb.str = sb.str.concat(_this.getCreator()); })(search);
                /* append */ (function (sb) { return sb.str = sb.str.concat('|'); })(search);
            }
            this.filterCollationKey = CatalogTexture.COMPARATOR_$LI$().getCollationKey(/* toString */ search.str).toByteArray();
        }
        return this.filterCollationKey;
    };
    /**
     * Returns <code>true</code> if the given filter collation key is a sub part of the first array collator key.
     * @param {Array} collationKey
     * @param {Array} filterCollationKey
     * @param {number} start
     * @return {boolean}
     * @private
     */
    CatalogTexture.prototype.isSubCollationKey = function (collationKey, filterCollationKey, start) {
        for (var i = start, n = collationKey.length - 4, m = filterCollationKey.length - 4; i < n && i < n - m + 1; i++) {
            if (collationKey[i] === filterCollationKey[0]) {
                for (var j = 1; j < m; j++) {
                    if (collationKey[i + j] !== filterCollationKey[j]) {
                        return this.isSubCollationKey(collationKey, filterCollationKey, i + 1);
                    }
                }
                return true;
            }
        }
        return false;
    };
    return CatalogTexture;
}());
CatalogTexture.__static_initialized = false;
CatalogTexture["__class"] = "CatalogTexture";
CatalogTexture["__interfaces"] = ["com.eteks.sweethome3d.model.CatalogItem", "java.lang.Comparable", "com.eteks.sweethome3d.model.TextureImage", "java.io.Serializable"];
/**
 * Creates a collection change support.
 * @param {*} source  the collection to which data will be added.
 * @class
 */
var CollectionChangeSupport = (function () {
    function CollectionChangeSupport(source) {
        this.source = null;
        this.collectionListeners = null;
        this.source = source;
        this.collectionListeners = ([]);
    }
    /**
     * Adds the <code>listener</code> in parameter to the list of listeners that may be notified.
     * @param {CollectionListener} listener  the listener to add
     */
    CollectionChangeSupport.prototype.addCollectionListener = function (listener) {
        /* add */ this.collectionListeners.push(listener);
    };
    /**
     * Removes the <code>listener</code> in parameter to the list of listeners that may be notified.
     * @param {CollectionListener} listener  the listener to remove. If it doesn't exist, it's simply ignored.
     */
    CollectionChangeSupport.prototype.removeCollectionListener = function (listener) {
        /* remove */ (function (a) { return a.splice(a.indexOf(listener), 1); })(this.collectionListeners);
    };
    /**
     * Fires a collection event about <code>item</code>.
     * @param {*} item     the added ore deleted item
     * @param {CollectionEvent.Type} eventType <code>CollectionEvent.Type.ADD</code> or <code>CollectionEvent.Type.DELETE</code>
     */
    CollectionChangeSupport.prototype.fireCollectionChanged$java_lang_Object$com_eteks_sweethome3d_model_CollectionEvent_Type = function (item, eventType) {
        this.fireCollectionChanged(item, -1, eventType);
    };
    /**
     * Fires a collection event about <code>item</code> at a given <code>index</code>.
     * @param {*} item     the added ore deleted item
     * @param {number} index    the optional index at which the item was added or deleted
     * @param {CollectionEvent.Type} eventType <code>CollectionEvent.Type.ADD</code> or <code>CollectionEvent.Type.DELETE</code>
     */
    CollectionChangeSupport.prototype.fireCollectionChanged$java_lang_Object$int$com_eteks_sweethome3d_model_CollectionEvent_Type = function (item, index, eventType) {
        if (!(this.collectionListeners.length == 0)) {
            var event_1 = (new CollectionEvent(this.source, item, index, eventType));
            var listeners = this.collectionListeners.slice(0);
            for (var index131 = 0; index131 < listeners.length; index131++) {
                var listener = listeners[index131];
                {
                    listener(event_1);
                }
            }
        }
    };
    /**
     * Fires a collection event about <code>item</code> at a given <code>index</code>.
     * @param {*} item     the added ore deleted item
     * @param {number} index    the optional index at which the item was added or deleted
     * @param {CollectionEvent.Type} eventType <code>CollectionEvent.Type.ADD</code> or <code>CollectionEvent.Type.DELETE</code>
     */
    CollectionChangeSupport.prototype.fireCollectionChanged = function (item, index, eventType) {
        if (((item != null) || item === null) && ((typeof index === 'number') || index === null) && ((typeof eventType === 'number') || eventType === null)) {
            return this.fireCollectionChanged$java_lang_Object$int$com_eteks_sweethome3d_model_CollectionEvent_Type(item, index, eventType);
        }
        else if (((item != null) || item === null) && ((typeof index === 'number') || index === null) && eventType === undefined) {
            return this.fireCollectionChanged$java_lang_Object$com_eteks_sweethome3d_model_CollectionEvent_Type(item, index);
        }
        else
            throw new Error('invalid overload');
    };
    return CollectionChangeSupport;
}());
CollectionChangeSupport["__class"] = "CollectionChangeSupport";
/**
 * Creates an event for an item with its index.
 * @param {*} source the object to which an item was added or deleted
 * @param {*} item   the added or deleted item
 * @param {number} index  the index at which the item was added or deleted, or -1 if unknown
 * @param {CollectionEvent.Type} type   <code>CollectionEvent.Type.ADD</code> or <code>CollectionEvent.Type.DELETE</code>
 * @class
 */
var CollectionEvent = (function () {
    function CollectionEvent(source, item, index, type) {
        var _this = this;
        if (((source != null) || source === null) && ((item != null) || item === null) && ((typeof index === 'number') || index === null) && ((typeof type === 'number') || type === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.item = null;
            this.index = 0;
            this.type = null;
            this.item = null;
            this.index = 0;
            this.type = null;
            (function () {
                _this.item = item;
                _this.index = index;
                _this.type = type;
            })();
        }
        else if (((source != null) || source === null) && ((item != null) || item === null) && ((typeof index === 'number') || index === null) && type === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var type_1 = __args[2];
            {
                var __args_10 = Array.prototype.slice.call(arguments);
                var index_1 = -1;
                this.item = null;
                this.index = 0;
                this.type = null;
                this.item = null;
                this.index = 0;
                this.type = null;
                (function () {
                    _this.item = item;
                    _this.index = index_1;
                    _this.type = type_1;
                })();
            }
        }
        else
            throw new Error('invalid overload');
    }
    /**
     * Returns the added or deleted item.
     * @return {*}
     */
    CollectionEvent.prototype.getItem = function () {
        return this.item;
    };
    /**
     * Returns the index of the item in collection or -1 if this index is unknown.
     * @return {number}
     */
    CollectionEvent.prototype.getIndex = function () {
        return this.index;
    };
    /**
     * Returns the type of event.
     * @return {CollectionEvent.Type}
     */
    CollectionEvent.prototype.getType = function () {
        return this.type;
    };
    return CollectionEvent;
}());
CollectionEvent["__class"] = "CollectionEvent";
CollectionEvent["__interfaces"] = ["java.io.Serializable"];
(function (CollectionEvent) {
    /**
     * The type of change in the collection.
     * @enum
     */
    var Type;
    (function (Type) {
        Type[Type["ADD"] = 0] = "ADD";
        Type[Type["DELETE"] = 1] = "DELETE";
    })(Type = CollectionEvent.Type || (CollectionEvent.Type = {}));
})(CollectionEvent || (CollectionEvent = {}));
/**
 * Furniture catalog.
 * @author Emmanuel Puybaret
 */
var FurnitureCatalog = (function () {
    function FurnitureCatalog() {
        /*private*/ this.categories = ([]);
        /*private*/ this.furnitureChangeSupport = (new CollectionChangeSupport(this));
    }
    /**
     * Returns the categories list sorted by name.
     * @return {Array} an unmodifiable list of categories.
     */
    FurnitureCatalog.prototype.getCategories = function () {
        return this.categories.slice(0);
    };
    /**
     * Returns the count of categories in this catalog.
     * @return {number}
     */
    FurnitureCatalog.prototype.getCategoriesCount = function () {
        return this.categories.length;
    };
    /**
     * Returns the category at a given <code>index</code>.
     * @param {number} index
     * @return {FurnitureCategory}
     */
    FurnitureCatalog.prototype.getCategory = function (index) {
        return this.categories[index];
    };
    /**
     * Adds the furniture <code>listener</code> in parameter to this catalog.
     * @param {CollectionListener} listener
     */
    FurnitureCatalog.prototype.addFurnitureListener = function (listener) {
        this.furnitureChangeSupport.addCollectionListener((listener));
    };
    /**
     * Removes the furniture <code>listener</code> in parameter from this catalog.
     * @param {CollectionListener} listener
     */
    FurnitureCatalog.prototype.removeFurnitureListener = function (listener) {
        this.furnitureChangeSupport.removeCollectionListener((listener));
    };
    /**
     * Adds <code>piece</code> of a given <code>category</code> to this catalog.
     * Once the <code>piece</code> is added, furniture listeners added to this catalog will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification.
     * @param {FurnitureCategory} category the category of the piece.
     * @param {CatalogPieceOfFurniture} piece    a piece of furniture.
     */
    FurnitureCatalog.prototype.add = function (category, piece) {
        var index = (function (l, key) { var comp = function (a, b) { return a.localeCompare(b); }; var low = 0; var high = l.length - 1; while (low <= high) {
            var mid = (low + high) >>> 1;
            var midVal = l[mid];
            var cmp = comp(midVal, key);
            if (cmp < 0)
                low = mid + 1;
            else if (cmp > 0)
                high = mid - 1;
            else
                return mid;
        } return -(low + 1); })(this.categories, category);
        if (index < 0) {
            category = new FurnitureCategory(category.getName());
            /* add */ this.categories.splice(-index - 1, 0, category);
        }
        else {
            category = this.categories[index];
        }
        category.add(piece);
        this.furnitureChangeSupport.fireCollectionChanged(piece, category.getIndexOfPieceOfFurniture(piece), CollectionEvent.Type.ADD);
    };
    /**
     * Deletes the <code>piece</code> from this catalog.
     * If then piece category is empty, it will be removed from the categories of this catalog.
     * Once the <code>piece</code> is deleted, furniture listeners added to this catalog will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification.
     * @param {CatalogPieceOfFurniture} piece a piece of furniture in that category.
     */
    FurnitureCatalog.prototype["delete"] = function (piece) {
        var category = piece.getCategory();
        if (category != null) {
            var pieceIndex = category.getIndexOfPieceOfFurniture(piece);
            if (pieceIndex >= 0) {
                category["delete"](piece);
                if (category.getFurnitureCount() === 0) {
                    this.categories = (this.categories.slice(0));
                    /* remove */ (function (a) { return a.splice(a.indexOf(category), 1); })(this.categories);
                }
                this.furnitureChangeSupport.fireCollectionChanged(piece, pieceIndex, CollectionEvent.Type.DELETE);
                return;
            }
        }
        throw new IllegalArgumentException("catalog doesn\'t contain piece " + piece.getName());
    };
    return FurnitureCatalog;
}());
FurnitureCatalog["__class"] = "FurnitureCatalog";
/**
 * Create a category.
 * @param {string} name the name of the category.
 * @class
 */
var FurnitureCategory = (function () {
    function FurnitureCategory(name) {
        this.name = null;
        this.furniture = null;
        this.name = name;
        this.furniture = ([]);
    }
    FurnitureCategory.COMPARATOR_$LI$ = function () { if (FurnitureCategory.COMPARATOR == null)
        FurnitureCategory.COMPARATOR = (function (o1, o2) { return o1.toString().localeCompare(o2.toString()); }); return FurnitureCategory.COMPARATOR; };
    ;
    /**
     * Returns the name of this category.
     * @return {string}
     */
    FurnitureCategory.prototype.getName = function () {
        return this.name;
    };
    /**
     * Returns the furniture list of this category sorted by name.
     * @return {Array} an unmodifiable list of furniture.
     */
    FurnitureCategory.prototype.getFurniture = function () {
        return this.furniture.slice(0);
    };
    /**
     * Returns the count of furniture in this category.
     * @return {number}
     */
    FurnitureCategory.prototype.getFurnitureCount = function () {
        return this.furniture.length;
    };
    /**
     * Returns the piece of furniture at a given <code>index</code>.
     * @param {number} index
     * @return {CatalogPieceOfFurniture}
     */
    FurnitureCategory.prototype.getPieceOfFurniture = function (index) {
        return this.furniture[index];
    };
    /**
     * Returns the index of the given <code>piece</code> of furniture.
     * @since 3.6
     * @param {CatalogPieceOfFurniture} piece
     * @return {number}
     */
    FurnitureCategory.prototype.getIndexOfPieceOfFurniture = function (piece) {
        return this.furniture.indexOf(piece);
    };
    /**
     * Adds a piece of furniture to this category.
     * @param {CatalogPieceOfFurniture} piece the piece to add.
     */
    FurnitureCategory.prototype.add = function (piece) {
        piece.setCategory(this);
        var index = (function (l, key) { var comp = function (a, b) { return a.localeCompare(b); }; var low = 0; var high = l.length - 1; while (low <= high) {
            var mid = (low + high) >>> 1;
            var midVal = l[mid];
            var cmp = comp(midVal, key);
            if (cmp < 0)
                low = mid + 1;
            else if (cmp > 0)
                high = mid - 1;
            else
                return mid;
        } return -(low + 1); })(this.furniture, piece);
        if (index < 0) {
            index = -index - 1;
        }
        /* add */ this.furniture.splice(index, 0, piece);
    };
    /**
     * Deletes a piece of furniture from this category.
     * @param {CatalogPieceOfFurniture} piece the piece to remove.
     * @throws IllegalArgumentException if the piece doesn't exist in this category.
     */
    FurnitureCategory.prototype["delete"] = function (piece) {
        var pieceIndex = this.furniture.indexOf(piece);
        if (pieceIndex === -1) {
            throw new IllegalArgumentException(this.name + " doesn\'t contain piece " + piece.getName());
        }
        this.furniture = (this.furniture.slice(0));
        /* remove */ this.furniture.splice(pieceIndex, 1);
    };
    /**
     * Returns <code>true</code> if this category and the one in parameter have the same name.
     * @param {*} obj
     * @return {boolean}
     */
    FurnitureCategory.prototype.equals = function (obj) {
        return (obj != null && obj instanceof FurnitureCategory) && (function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(FurnitureCategory.COMPARATOR_$LI$(), this.name);
    };
    /**
     * Compares the names of this category and the one in parameter.
     * @param {FurnitureCategory} category
     * @return {number}
     */
    FurnitureCategory.prototype.compareTo = function (category) {
        return FurnitureCategory.COMPARATOR_$LI$().compare(this.name, category.name);
    };
    return FurnitureCategory;
}());
FurnitureCategory["__class"] = "FurnitureCategory";
FurnitureCategory["__interfaces"] = ["java.lang.Comparable"];
/**
 * Application managing a list of homes displayed at screen.
 * @author Emmanuel Puybaret
 */
var HomeApplication = (function () {
    function HomeApplication() {
        /*private*/ this.homes = ([]);
        /*private*/ this.homesChangeSupport = (new CollectionChangeSupport(this));
    }
    /**
     * Adds the home <code>listener</code> in parameter to this application.
     * @param {CollectionListener} listener
     */
    HomeApplication.prototype.addHomesListener = function (listener) {
        this.homesChangeSupport.addCollectionListener((listener));
    };
    /**
     * Removes the home <code>listener</code> in parameter from this application.
     * @param {CollectionListener} listener
     */
    HomeApplication.prototype.removeHomesListener = function (listener) {
        this.homesChangeSupport.removeCollectionListener((listener));
    };
    /**
     * Returns a new home.
     * @return {Home} a new home with wall heights equal to the one in user preferences.
     * @since 2.2
     */
    HomeApplication.prototype.createHome = function () {
        return new Home(this.getUserPreferences().getNewWallHeight());
    };
    /**
     * Returns an unmodifiable collection of the homes of this application.
     * @return {Array}
     */
    HomeApplication.prototype.getHomes = function () {
        return this.homes.slice(0);
    };
    /**
     * Adds a given <code>home</code> to the homes list of this application.
     * Once the <code>home</code> is added, home listeners added
     * to this application will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {Home} home
     */
    HomeApplication.prototype.addHome = function (home) {
        this.homes = (this.homes.slice(0));
        /* add */ this.homes.push(home);
        this.homesChangeSupport.fireCollectionChanged(home, /* size */ this.homes.length - 1, CollectionEvent.Type.ADD);
    };
    /**
     * Removes a given <code>home</code> from the homes list  of this application.
     * Once the <code>home</code> is removed, home listeners added
     * to this application will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#DELETE}.
     * @param {Home} home
     */
    HomeApplication.prototype.deleteHome = function (home) {
        var index = this.homes.indexOf(home);
        if (index !== -1) {
            this.homes = (this.homes.slice(0));
            /* remove */ this.homes.splice(index, 1);
            this.homesChangeSupport.fireCollectionChanged(home, index, CollectionEvent.Type.DELETE);
        }
    };
    /**
     * Returns the default recorder able to write and read homes.
     * @return {HomeRecorder}
     */
    HomeApplication.prototype.getHomeRecorder$ = function () { throw new Error('cannot invoke abstract overloaded method... check your argument(s) type(s)'); };
    /**
     * Returns a recorder of a given <code>type</code> able to write and read homes.
     * Subclasses may override this method to return a recorder matching <code>type</code>.
     * @param {HomeRecorder.Type} type  a hint for the application to choose the returned recorder.
     * @return {HomeRecorder} the default recorder able to write and read homes.
     * @since 1.8
     */
    HomeApplication.prototype.getHomeRecorder$com_eteks_sweethome3d_model_HomeRecorder_Type = function (type) {
        return this.getHomeRecorder();
    };
    /**
     * Returns a recorder of a given <code>type</code> able to write and read homes.
     * Subclasses may override this method to return a recorder matching <code>type</code>.
     * @param {HomeRecorder.Type} type  a hint for the application to choose the returned recorder.
     * @return {HomeRecorder} the default recorder able to write and read homes.
     * @since 1.8
     */
    HomeApplication.prototype.getHomeRecorder = function (type) {
        if (((typeof type === 'number') || type === null)) {
            return this.getHomeRecorder$com_eteks_sweethome3d_model_HomeRecorder_Type(type);
        }
        else if (type === undefined) {
            return this.getHomeRecorder$();
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Returns the name of this application. Default implementation returns <i>Sweet Home 3D</i>.
     * @since 1.6
     * @return {string}
     */
    HomeApplication.prototype.getName = function () {
        return "Sweet Home 3D";
    };
    /**
     * Returns information about the version of this application.
     * Default implementation returns an empty string.
     * @since 1.6
     * @return {string}
     */
    HomeApplication.prototype.getVersion = function () {
        return "";
    };
    /**
     * Returns the id of this application.
     * Default implementation returns null.
     * @since 4.0
     * @return {string}
     */
    HomeApplication.prototype.getId = function () {
        return null;
    };
    return HomeApplication;
}());
HomeApplication["__class"] = "HomeApplication";
/**
 * Creates home environment from parameters.
 * @since 2.2
 * @param {number} groundColor
 * @param {HomeTexture} groundTexture
 * @param {number} skyColor
 * @param {HomeTexture} skyTexture
 * @param {number} lightColor
 * @param {number} wallsAlpha
 * @class
 */
var HomeEnvironment = (function () {
    function HomeEnvironment(groundColor, groundTexture, skyColor, skyTexture, lightColor, wallsAlpha) {
        var _this = this;
        /*private*/ this.propertyChangeSupport = new PropertyChangeSupport(this);
        if (((typeof groundColor === 'number') || groundColor === null) && ((groundTexture != null && groundTexture instanceof HomeTexture) || groundTexture === null) && ((typeof skyColor === 'number') || skyColor === null) && ((skyTexture != null && skyTexture instanceof HomeTexture) || skyTexture === null) && ((typeof lightColor === 'number') || lightColor === null) && ((typeof wallsAlpha === 'number') || wallsAlpha === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.observerCameraElevationAdjusted = false;
            this.groundColor = 0;
            this.groundTexture = null;
            this.skyColor = 0;
            this.skyTexture = null;
            this.lightColor = 0;
            this.ceilingLightColor = 0;
            this.wallsAlpha = 0;
            this.drawingMode = null;
            this.subpartSizeUnderLight = 0;
            this.allLevelsVisible = false;
            this.photoWidth = 0;
            this.photoHeight = 0;
            this.photoAspectRatio = null;
            this.photoAspectRatioName = null;
            this.photoQuality = 0;
            this.videoWidth = 0;
            this.videoAspectRatio = null;
            this.videoAspectRatioName = null;
            this.videoQuality = 0;
            this.videoFrameRate = 0;
            this.cameraPath = null;
            this.propertyChangeSupport = new PropertyChangeSupport(this);
            this.observerCameraElevationAdjusted = false;
            this.groundColor = 0;
            this.groundTexture = null;
            this.skyColor = 0;
            this.skyTexture = null;
            this.lightColor = 0;
            this.ceilingLightColor = 0;
            this.wallsAlpha = 0;
            this.drawingMode = null;
            this.subpartSizeUnderLight = 0;
            this.allLevelsVisible = false;
            this.photoWidth = 0;
            this.photoHeight = 0;
            this.photoAspectRatio = null;
            this.photoAspectRatioName = null;
            this.photoQuality = 0;
            this.videoWidth = 0;
            this.videoAspectRatio = null;
            this.videoAspectRatioName = null;
            this.videoQuality = 0;
            this.videoFrameRate = 0;
            this.cameraPath = null;
            (function () {
                _this.observerCameraElevationAdjusted = true;
                _this.groundColor = groundColor;
                _this.groundTexture = groundTexture;
                _this.skyColor = skyColor;
                _this.skyTexture = skyTexture;
                _this.lightColor = lightColor;
                _this.ceilingLightColor = 13684944;
                _this.wallsAlpha = wallsAlpha;
                _this.drawingMode = HomeEnvironment.DrawingMode.FILL;
                _this.photoWidth = 400;
                _this.photoHeight = 300;
                _this.photoAspectRatio = AspectRatio.VIEW_3D_RATIO;
                _this.videoWidth = 320;
                _this.videoAspectRatio = AspectRatio.RATIO_4_3;
                _this.videoFrameRate = 25;
                _this.cameraPath = [];
            })();
        }
        else if (((typeof groundColor === 'number') || groundColor === null) && ((groundTexture != null && groundTexture instanceof HomeTexture) || groundTexture === null) && ((typeof skyColor === 'number') || skyColor === null) && ((typeof skyTexture === 'number') || skyTexture === null) && ((typeof lightColor === 'number') || lightColor === null) && wallsAlpha === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var lightColor_1 = __args[3];
            var wallsAlpha_1 = __args[4];
            {
                var __args_11 = Array.prototype.slice.call(arguments);
                var skyTexture_1 = null;
                this.observerCameraElevationAdjusted = false;
                this.groundColor = 0;
                this.groundTexture = null;
                this.skyColor = 0;
                this.skyTexture = null;
                this.lightColor = 0;
                this.ceilingLightColor = 0;
                this.wallsAlpha = 0;
                this.drawingMode = null;
                this.subpartSizeUnderLight = 0;
                this.allLevelsVisible = false;
                this.photoWidth = 0;
                this.photoHeight = 0;
                this.photoAspectRatio = null;
                this.photoAspectRatioName = null;
                this.photoQuality = 0;
                this.videoWidth = 0;
                this.videoAspectRatio = null;
                this.videoAspectRatioName = null;
                this.videoQuality = 0;
                this.videoFrameRate = 0;
                this.cameraPath = null;
                this.propertyChangeSupport = new PropertyChangeSupport(this);
                this.observerCameraElevationAdjusted = false;
                this.groundColor = 0;
                this.groundTexture = null;
                this.skyColor = 0;
                this.skyTexture = null;
                this.lightColor = 0;
                this.ceilingLightColor = 0;
                this.wallsAlpha = 0;
                this.drawingMode = null;
                this.subpartSizeUnderLight = 0;
                this.allLevelsVisible = false;
                this.photoWidth = 0;
                this.photoHeight = 0;
                this.photoAspectRatio = null;
                this.photoAspectRatioName = null;
                this.photoQuality = 0;
                this.videoWidth = 0;
                this.videoAspectRatio = null;
                this.videoAspectRatioName = null;
                this.videoQuality = 0;
                this.videoFrameRate = 0;
                this.cameraPath = null;
                (function () {
                    _this.observerCameraElevationAdjusted = true;
                    _this.groundColor = groundColor;
                    _this.groundTexture = groundTexture;
                    _this.skyColor = skyColor;
                    _this.skyTexture = skyTexture_1;
                    _this.lightColor = lightColor_1;
                    _this.ceilingLightColor = 13684944;
                    _this.wallsAlpha = wallsAlpha_1;
                    _this.drawingMode = HomeEnvironment.DrawingMode.FILL;
                    _this.photoWidth = 400;
                    _this.photoHeight = 300;
                    _this.photoAspectRatio = AspectRatio.VIEW_3D_RATIO;
                    _this.videoWidth = 320;
                    _this.videoAspectRatio = AspectRatio.RATIO_4_3;
                    _this.videoFrameRate = 25;
                    _this.cameraPath = [];
                })();
            }
        }
        else if (groundColor === undefined && groundTexture === undefined && skyColor === undefined && skyTexture === undefined && lightColor === undefined && wallsAlpha === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_12 = Array.prototype.slice.call(arguments);
                var groundColor_1 = 11053224;
                var groundTexture_1 = null;
                var skyColor_1 = 13427964;
                var lightColor_2 = 13684944;
                var wallsAlpha_2 = 0;
                {
                    var __args_13 = Array.prototype.slice.call(arguments);
                    var skyTexture_2 = null;
                    this.observerCameraElevationAdjusted = false;
                    this.groundColor = 0;
                    this.groundTexture = null;
                    this.skyColor = 0;
                    this.skyTexture = null;
                    this.lightColor = 0;
                    this.ceilingLightColor = 0;
                    this.wallsAlpha = 0;
                    this.drawingMode = null;
                    this.subpartSizeUnderLight = 0;
                    this.allLevelsVisible = false;
                    this.photoWidth = 0;
                    this.photoHeight = 0;
                    this.photoAspectRatio = null;
                    this.photoAspectRatioName = null;
                    this.photoQuality = 0;
                    this.videoWidth = 0;
                    this.videoAspectRatio = null;
                    this.videoAspectRatioName = null;
                    this.videoQuality = 0;
                    this.videoFrameRate = 0;
                    this.cameraPath = null;
                    this.propertyChangeSupport = new PropertyChangeSupport(this);
                    this.observerCameraElevationAdjusted = false;
                    this.groundColor = 0;
                    this.groundTexture = null;
                    this.skyColor = 0;
                    this.skyTexture = null;
                    this.lightColor = 0;
                    this.ceilingLightColor = 0;
                    this.wallsAlpha = 0;
                    this.drawingMode = null;
                    this.subpartSizeUnderLight = 0;
                    this.allLevelsVisible = false;
                    this.photoWidth = 0;
                    this.photoHeight = 0;
                    this.photoAspectRatio = null;
                    this.photoAspectRatioName = null;
                    this.photoQuality = 0;
                    this.videoWidth = 0;
                    this.videoAspectRatio = null;
                    this.videoAspectRatioName = null;
                    this.videoQuality = 0;
                    this.videoFrameRate = 0;
                    this.cameraPath = null;
                    (function () {
                        _this.observerCameraElevationAdjusted = true;
                        _this.groundColor = groundColor_1;
                        _this.groundTexture = groundTexture_1;
                        _this.skyColor = skyColor_1;
                        _this.skyTexture = skyTexture_2;
                        _this.lightColor = lightColor_2;
                        _this.ceilingLightColor = 13684944;
                        _this.wallsAlpha = wallsAlpha_2;
                        _this.drawingMode = HomeEnvironment.DrawingMode.FILL;
                        _this.photoWidth = 400;
                        _this.photoHeight = 300;
                        _this.photoAspectRatio = AspectRatio.VIEW_3D_RATIO;
                        _this.videoWidth = 320;
                        _this.videoAspectRatio = AspectRatio.RATIO_4_3;
                        _this.videoFrameRate = 25;
                        _this.cameraPath = [];
                    })();
                }
            }
        }
        else
            throw new Error('invalid overload');
    }
    /**
     * Adds the property change <code>listener</code> in parameter to this environment.
     * @param {string} property
     * @param {PropertyChangeListener} listener
     */
    HomeEnvironment.prototype.addPropertyChangeListener = function (property, listener) {
        this.propertyChangeSupport.addPropertyChangeListener(/* name */ property, listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this environment.
     * @param {string} property
     * @param {PropertyChangeListener} listener
     */
    HomeEnvironment.prototype.removePropertyChangeListener = function (property, listener) {
        this.propertyChangeSupport.removePropertyChangeListener(/* name */ property, listener);
    };
    /**
     * Returns <code>true</code> if the observer elevation should be adjusted according
     * to the elevation of the selected level.
     * @since 3.5
     * @return {boolean}
     */
    HomeEnvironment.prototype.isObserverCameraElevationAdjusted = function () {
        return this.observerCameraElevationAdjusted;
    };
    /**
     * Sets whether the observer elevation should be adjusted according
     * to the elevation of the selected level and fires a <code>PropertyChangeEvent</code>.
     * @since 3.5
     * @param {boolean} observerCameraElevationAdjusted
     */
    HomeEnvironment.prototype.setObserverCameraElevationAdjusted = function (observerCameraElevationAdjusted) {
        if (this.observerCameraElevationAdjusted !== observerCameraElevationAdjusted) {
            this.observerCameraElevationAdjusted = observerCameraElevationAdjusted;
            this.propertyChangeSupport.firePropertyChange(/* name */ "OBSERVER_CAMERA_ELEVATION_ADJUSTED", !observerCameraElevationAdjusted, observerCameraElevationAdjusted);
        }
    };
    /**
     * Returns the ground color of this environment.
     * @return {number}
     */
    HomeEnvironment.prototype.getGroundColor = function () {
        return this.groundColor;
    };
    /**
     * Sets the ground color of this environment and fires a <code>PropertyChangeEvent</code>.
     * @param {number} groundColor
     */
    HomeEnvironment.prototype.setGroundColor = function (groundColor) {
        if (groundColor !== this.groundColor) {
            var oldGroundColor = this.groundColor;
            this.groundColor = groundColor;
            this.propertyChangeSupport.firePropertyChange(/* name */ "GROUND_COLOR", oldGroundColor, groundColor);
        }
    };
    /**
     * Returns the ground texture of this environment.
     * @return {HomeTexture}
     */
    HomeEnvironment.prototype.getGroundTexture = function () {
        return this.groundTexture;
    };
    /**
     * Sets the ground texture of this environment and fires a <code>PropertyChangeEvent</code>.
     * @param {HomeTexture} groundTexture
     */
    HomeEnvironment.prototype.setGroundTexture = function (groundTexture) {
        if (groundTexture !== this.groundTexture) {
            var oldGroundTexture = this.groundTexture;
            this.groundTexture = groundTexture;
            this.propertyChangeSupport.firePropertyChange(/* name */ "GROUND_TEXTURE", oldGroundTexture, groundTexture);
        }
    };
    /**
     * Returns the sky color of this environment.
     * @return {number}
     */
    HomeEnvironment.prototype.getSkyColor = function () {
        return this.skyColor;
    };
    /**
     * Sets the sky color of this environment and fires a <code>PropertyChangeEvent</code>.
     * @param {number} skyColor
     */
    HomeEnvironment.prototype.setSkyColor = function (skyColor) {
        if (skyColor !== this.skyColor) {
            var oldSkyColor = this.skyColor;
            this.skyColor = skyColor;
            this.propertyChangeSupport.firePropertyChange(/* name */ "SKY_COLOR", oldSkyColor, skyColor);
        }
    };
    /**
     * Returns the sky texture of this environment.
     * @return {HomeTexture}
     */
    HomeEnvironment.prototype.getSkyTexture = function () {
        return this.skyTexture;
    };
    /**
     * Sets the sky texture of this environment and fires a <code>PropertyChangeEvent</code>.
     * @param {HomeTexture} skyTexture
     */
    HomeEnvironment.prototype.setSkyTexture = function (skyTexture) {
        if (skyTexture !== this.skyTexture) {
            var oldSkyTexture = this.skyTexture;
            this.skyTexture = skyTexture;
            this.propertyChangeSupport.firePropertyChange(/* name */ "SKY_TEXTURE", oldSkyTexture, skyTexture);
        }
    };
    /**
     * Returns the light color of this environment.
     * @return {number}
     */
    HomeEnvironment.prototype.getLightColor = function () {
        return this.lightColor;
    };
    /**
     * Sets the color that lights this environment and fires a <code>PropertyChangeEvent</code>.
     * @param {number} lightColor
     */
    HomeEnvironment.prototype.setLightColor = function (lightColor) {
        if (lightColor !== this.lightColor) {
            var oldLightColor = this.lightColor;
            this.lightColor = lightColor;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LIGHT_COLOR", oldLightColor, lightColor);
        }
    };
    /**
     * Returns the color of ceiling lights.
     * @return {number}
     */
    HomeEnvironment.prototype.getCeillingLightColor = function () {
        return this.ceilingLightColor;
    };
    /**
     * Sets the color of ceiling lights and fires a <code>PropertyChangeEvent</code>.
     * @param {number} ceilingLightColor
     */
    HomeEnvironment.prototype.setCeillingLightColor = function (ceilingLightColor) {
        if (ceilingLightColor !== this.ceilingLightColor) {
            var oldCeilingLightColor = this.ceilingLightColor;
            this.ceilingLightColor = ceilingLightColor;
            this.propertyChangeSupport.firePropertyChange(/* name */ "CEILING_LIGHT_COLOR", oldCeilingLightColor, ceilingLightColor);
        }
    };
    /**
     * Returns the walls transparency alpha factor of this environment.
     * @return {number}
     */
    HomeEnvironment.prototype.getWallsAlpha = function () {
        return this.wallsAlpha;
    };
    /**
     * Sets the walls transparency alpha of this environment and fires a <code>PropertyChangeEvent</code>.
     * @param {number} wallsAlpha a value between 0 and 1, 0 meaning opaque and 1 invisible.
     */
    HomeEnvironment.prototype.setWallsAlpha = function (wallsAlpha) {
        if (wallsAlpha !== this.wallsAlpha) {
            var oldWallsAlpha = this.wallsAlpha;
            this.wallsAlpha = wallsAlpha;
            this.propertyChangeSupport.firePropertyChange(/* name */ "WALLS_ALPHA", oldWallsAlpha, wallsAlpha);
        }
    };
    /**
     * Returns the drawing mode of this environment.
     * @return {HomeEnvironment.DrawingMode}
     */
    HomeEnvironment.prototype.getDrawingMode = function () {
        return this.drawingMode;
    };
    /**
     * Sets the drawing mode of this environment and fires a <code>PropertyChangeEvent</code>.
     * @param {HomeEnvironment.DrawingMode} drawingMode
     */
    HomeEnvironment.prototype.setDrawingMode = function (drawingMode) {
        if (drawingMode !== this.drawingMode) {
            var oldDrawingMode = this.drawingMode;
            this.drawingMode = drawingMode;
            this.propertyChangeSupport.firePropertyChange(/* name */ "DRAWING_MODE", oldDrawingMode, drawingMode);
        }
    };
    /**
     * Returns the size of subparts under home lights in this environment.
     * @return {number} a size in centimeters or 0 if home lights don't illuminate home.
     * @since 3.7
     */
    HomeEnvironment.prototype.getSubpartSizeUnderLight = function () {
        return this.subpartSizeUnderLight;
    };
    /**
     * Sets the size of subparts under home lights of this environment and fires a <code>PropertyChangeEvent</code>.
     * @since 3.7
     * @param {number} subpartSizeUnderLight
     */
    HomeEnvironment.prototype.setSubpartSizeUnderLight = function (subpartSizeUnderLight) {
        if (subpartSizeUnderLight !== this.subpartSizeUnderLight) {
            var oldSubpartWidthUnderLight = this.subpartSizeUnderLight;
            this.subpartSizeUnderLight = subpartSizeUnderLight;
            this.propertyChangeSupport.firePropertyChange(/* name */ "SUBPART_SIZE_UNDER_LIGHT", oldSubpartWidthUnderLight, subpartSizeUnderLight);
        }
    };
    /**
     * Returns whether all levels should be visible or not.
     * @return {boolean}
     */
    HomeEnvironment.prototype.isAllLevelsVisible = function () {
        return this.allLevelsVisible;
    };
    /**
     * Sets whether all levels should be visible or not and fires a <code>PropertyChangeEvent</code>.
     * @param {boolean} allLevelsVisible
     */
    HomeEnvironment.prototype.setAllLevelsVisible = function (allLevelsVisible) {
        if (allLevelsVisible !== this.allLevelsVisible) {
            this.allLevelsVisible = allLevelsVisible;
            this.propertyChangeSupport.firePropertyChange(/* name */ "ALL_LEVELS_VISIBLE", !allLevelsVisible, allLevelsVisible);
        }
    };
    /**
     * Returns the preferred photo width.
     * @since 2.0
     * @return {number}
     */
    HomeEnvironment.prototype.getPhotoWidth = function () {
        return this.photoWidth;
    };
    /**
     * Sets the preferred photo width, and notifies
     * listeners of this change.
     * @since 2.0
     * @param {number} photoWidth
     */
    HomeEnvironment.prototype.setPhotoWidth = function (photoWidth) {
        if (this.photoWidth !== photoWidth) {
            var oldPhotoWidth = this.photoWidth;
            this.photoWidth = photoWidth;
            this.propertyChangeSupport.firePropertyChange(/* name */ "PHOTO_WIDTH", oldPhotoWidth, photoWidth);
        }
    };
    /**
     * Returns the preferred photo height.
     * @since 2.0
     * @return {number}
     */
    HomeEnvironment.prototype.getPhotoHeight = function () {
        return this.photoHeight;
    };
    /**
     * Sets the preferred photo height, and notifies
     * listeners of this change.
     * @since 2.0
     * @param {number} photoHeight
     */
    HomeEnvironment.prototype.setPhotoHeight = function (photoHeight) {
        if (this.photoHeight !== photoHeight) {
            var oldPhotoHeight = this.photoHeight;
            this.photoHeight = photoHeight;
            this.propertyChangeSupport.firePropertyChange(/* name */ "PHOTO_HEIGHT", oldPhotoHeight, photoHeight);
        }
    };
    /**
     * Returns the preferred photo aspect ratio.
     * @since 2.0
     * @return {AspectRatio}
     */
    HomeEnvironment.prototype.getPhotoAspectRatio = function () {
        return this.photoAspectRatio;
    };
    /**
     * Sets the preferred photo aspect ratio, and notifies
     * listeners of this change.
     * @since 2.0
     * @param {AspectRatio} photoAspectRatio
     */
    HomeEnvironment.prototype.setPhotoAspectRatio = function (photoAspectRatio) {
        if (this.photoAspectRatio !== photoAspectRatio) {
            var oldPhotoAspectRatio = this.photoAspectRatio;
            this.photoAspectRatio = photoAspectRatio;
            this.propertyChangeSupport.firePropertyChange(/* name */ "PHOTO_ASPECT_RATIO", oldPhotoAspectRatio, photoAspectRatio);
        }
    };
    /**
     * Returns the preferred photo quality.
     * @since 2.0
     * @return {number}
     */
    HomeEnvironment.prototype.getPhotoQuality = function () {
        return this.photoQuality;
    };
    /**
     * Sets preferred photo quality, and notifies
     * listeners of this change.
     * @since 2.0
     * @param {number} photoQuality
     */
    HomeEnvironment.prototype.setPhotoQuality = function (photoQuality) {
        if (this.photoQuality !== photoQuality) {
            var oldPhotoQuality = this.photoQuality;
            this.photoQuality = photoQuality;
            this.propertyChangeSupport.firePropertyChange(/* name */ "PHOTO_QUALITY", oldPhotoQuality, photoQuality);
        }
    };
    /**
     * Returns the preferred video width.
     * @since 2.3
     * @return {number}
     */
    HomeEnvironment.prototype.getVideoWidth = function () {
        return this.videoWidth;
    };
    /**
     * Sets the preferred video width, and notifies
     * listeners of this change.
     * @since 2.3
     * @param {number} videoWidth
     */
    HomeEnvironment.prototype.setVideoWidth = function (videoWidth) {
        if (this.videoWidth !== videoWidth) {
            var oldVideoWidth = this.videoWidth;
            this.videoWidth = videoWidth;
            this.propertyChangeSupport.firePropertyChange(/* name */ "VIDEO_WIDTH", oldVideoWidth, videoWidth);
        }
    };
    /**
     * Returns the preferred video height.
     * @since 2.3
     * @return {number}
     */
    HomeEnvironment.prototype.getVideoHeight = function () {
        return Math.round(this.getVideoWidth() / { FREE_RATIO: null, VIEW_3D_RATIO: null, RATIO_4_3: 4 / 3, RATIO_3_2: 1.5, RATIO_16_9: 16 / 9, RATIO_2_1: 2 / 1, SQUARE_RATIO: 1 }[this.getVideoAspectRatio()]);
    };
    /**
     * Returns the preferred video aspect ratio.
     * @since 2.3
     * @return {AspectRatio}
     */
    HomeEnvironment.prototype.getVideoAspectRatio = function () {
        return this.videoAspectRatio;
    };
    /**
     * Sets the preferred video aspect ratio, and notifies
     * listeners of this change.
     * @since 2.3
     * @param {AspectRatio} videoAspectRatio
     */
    HomeEnvironment.prototype.setVideoAspectRatio = function (videoAspectRatio) {
        if (this.videoAspectRatio !== videoAspectRatio) {
            if ({ FREE_RATIO: null, VIEW_3D_RATIO: null, RATIO_4_3: 4 / 3, RATIO_3_2: 1.5, RATIO_16_9: 16 / 9, RATIO_2_1: 2 / 1, SQUARE_RATIO: 1 }[videoAspectRatio] == null) {
                throw new IllegalArgumentException("Unsupported aspect ratio " + videoAspectRatio);
            }
            var oldVideoAspectRatio = this.videoAspectRatio;
            this.videoAspectRatio = videoAspectRatio;
            this.propertyChangeSupport.firePropertyChange(/* name */ "VIDEO_ASPECT_RATIO", oldVideoAspectRatio, videoAspectRatio);
        }
    };
    /**
     * Returns preferred video quality.
     * @since 2.3
     * @return {number}
     */
    HomeEnvironment.prototype.getVideoQuality = function () {
        return this.videoQuality;
    };
    /**
     * Sets the preferred video quality, and notifies
     * listeners of this change.
     * @since 2.3
     * @param {number} videoQuality
     */
    HomeEnvironment.prototype.setVideoQuality = function (videoQuality) {
        if (this.videoQuality !== videoQuality) {
            var oldVideoQuality = this.videoQuality;
            this.videoQuality = videoQuality;
            this.propertyChangeSupport.firePropertyChange(/* name */ "VIDEO_QUALITY", oldVideoQuality, videoQuality);
        }
    };
    /**
     * Returns the preferred video frame rate.
     * @since 2.3
     * @return {number}
     */
    HomeEnvironment.prototype.getVideoFrameRate = function () {
        return this.videoFrameRate;
    };
    /**
     * Sets the preferred video frame rate, and notifies
     * listeners of this change.
     * @since 2.3
     * @param {number} videoFrameRate
     */
    HomeEnvironment.prototype.setVideoFrameRate = function (videoFrameRate) {
        if (this.videoFrameRate !== videoFrameRate) {
            var oldVideoFrameRate = this.videoFrameRate;
            this.videoFrameRate = videoFrameRate;
            this.propertyChangeSupport.firePropertyChange(/* name */ "VIDEO_FRAME_RATE", oldVideoFrameRate, videoFrameRate);
        }
    };
    /**
     * Returns the preferred video camera path.
     * @since 2.3
     * @return {Array}
     */
    HomeEnvironment.prototype.getVideoCameraPath = function () {
        return this.cameraPath.slice(0);
    };
    /**
     * Sets the preferred video camera path, and notifies
     * listeners of this change.
     * @since 2.3
     * @param {Array} cameraPath
     */
    HomeEnvironment.prototype.setVideoCameraPath = function (cameraPath) {
        if (this.cameraPath !== cameraPath) {
            var oldCameraPath = this.cameraPath;
            if (cameraPath != null) {
                this.cameraPath = (cameraPath.slice(0));
            }
            else {
                this.cameraPath = [];
            }
            this.propertyChangeSupport.firePropertyChange(/* name */ "VIDEO_CAMERA_PATH", oldCameraPath, cameraPath);
        }
    };
    /**
     * Returns a clone of this environment.
     * @since 2.3
     * @return {HomeEnvironment}
     */
    HomeEnvironment.prototype.clone = function () {
        try {
            var clone = (function (o) { var clone = Object.create(o); for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone[p] = o[p];
            } return clone; })(this);
            clone.cameraPath = ([]);
            for (var index132 = 0; index132 < this.cameraPath.length; index132++) {
                var camera = this.cameraPath[index132];
                {
                    /* add */ clone.cameraPath.push(/* clone */ /* clone */ (function (o) { if (o.clone != undefined) {
                        return o.clone();
                    }
                    else {
                        var clone_1 = Object.create(o);
                        for (var p in o) {
                            if (o.hasOwnProperty(p))
                                clone_1[p] = o[p];
                        }
                        return clone_1;
                    } })(camera));
                }
            }
            clone.propertyChangeSupport = new PropertyChangeSupport(clone);
            return clone;
        }
        catch (ex) {
            throw new IllegalStateException("Super class isn\'t cloneable");
        }
        ;
    };
    return HomeEnvironment;
}());
HomeEnvironment["__class"] = "HomeEnvironment";
HomeEnvironment["__interfaces"] = ["java.lang.Cloneable", "java.io.Serializable"];
(function (HomeEnvironment) {
    /**
     * The various modes used to draw home in 3D.
     * @enum
     */
    var DrawingMode;
    (function (DrawingMode) {
        DrawingMode[DrawingMode["FILL"] = 0] = "FILL";
        DrawingMode[DrawingMode["OUTLINE"] = 1] = "OUTLINE";
        DrawingMode[DrawingMode["FILL_AND_OUTLINE"] = 2] = "FILL_AND_OUTLINE";
    })(DrawingMode = HomeEnvironment.DrawingMode || (HomeEnvironment.DrawingMode = {}));
})(HomeEnvironment || (HomeEnvironment = {}));
/**
 * Creates a material instance from parameters.
 * @since 5.3
 * @param {string} name
 * @param {string} key
 * @param {number} color
 * @param {HomeTexture} texture
 * @param {number} shininess
 * @class
 */
var HomeMaterial = (function () {
    function HomeMaterial(name, key, color, texture, shininess) {
        var _this = this;
        if (((typeof name === 'string') || name === null) && ((typeof key === 'string') || key === null) && ((typeof color === 'number') || color === null) && ((texture != null && texture instanceof HomeTexture) || texture === null) && ((typeof shininess === 'number') || shininess === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.name = null;
            this.key = null;
            this.color = null;
            this.texture = null;
            this.shininess = null;
            this.name = null;
            this.key = null;
            this.color = null;
            this.texture = null;
            this.shininess = null;
            (function () {
                _this.name = name;
                _this.key = key;
                _this.color = color;
                _this.texture = texture;
                _this.shininess = shininess;
            })();
        }
        else if (((typeof name === 'string') || name === null) && ((typeof key === 'number') || key === null) && ((color != null && color instanceof HomeTexture) || color === null) && ((typeof texture === 'number') || texture === null) && shininess === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var color_3 = __args[1];
            var texture_1 = __args[2];
            var shininess_1 = __args[3];
            {
                var __args_14 = Array.prototype.slice.call(arguments);
                var key_1 = null;
                this.name = null;
                this.key = null;
                this.color = null;
                this.texture = null;
                this.shininess = null;
                this.name = null;
                this.key = null;
                this.color = null;
                this.texture = null;
                this.shininess = null;
                (function () {
                    _this.name = name;
                    _this.key = key_1;
                    _this.color = color_3;
                    _this.texture = texture_1;
                    _this.shininess = shininess_1;
                })();
            }
        }
        else
            throw new Error('invalid overload');
    }
    /**
     * Returns the name of this material.
     * @return {string} the name of the material or <code>null</code> if material has no name.
     * @since 4.0
     */
    HomeMaterial.prototype.getName = function () {
        return this.name;
    };
    /**
     * Returns the key of this material. If not <code>null</code>, this key should be used
     * as the unique identifier to find this material among the ones available on a model,
     * rather than the name of this material.
     * @return {string} the key of the material or <code>null</code> if material has no key.
     * @since 5.3
     */
    HomeMaterial.prototype.getKey = function () {
        return this.key;
    };
    /**
     * Returns the color of this material.
     * @return {number} the color of the material as RGB code or <code>null</code> if material color is unchanged.
     * @since 4.0
     */
    HomeMaterial.prototype.getColor = function () {
        return this.color;
    };
    /**
     * Returns the texture of this material.
     * @return {HomeTexture} the texture of the material or <code>null</code> if material texture is unchanged.
     * @since 4.0
     */
    HomeMaterial.prototype.getTexture = function () {
        return this.texture;
    };
    /**
     * Returns the shininess of this material.
     * @return {number} a value between 0 (matt) and 1 (very shiny) or <code>null</code> if material shininess is unchanged.
     * @since 4.0
     */
    HomeMaterial.prototype.getShininess = function () {
        return this.shininess;
    };
    return HomeMaterial;
}());
HomeMaterial["__class"] = "HomeMaterial";
HomeMaterial["__interfaces"] = ["java.io.Serializable"];
/**
 * An object with data where users can stored their own properties.
 * @author Emmanuel Puybaret
 * @since 5.3
 */
var HomeObject = (function () {
    function HomeObject() {
        this.properties = null;
    }
    /**
     * Returns the value of the property <code>name</code> associated with this object.
     * @return {string} the value of the property or <code>null</code> if it doesn't exist.
     * @param {string} name
     */
    HomeObject.prototype.getProperty = function (name) {
        if (this.properties != null) {
            return (function (m, k) { return m[k] ? m[k] : null; })(this.properties, name);
        }
        else {
            return null;
        }
    };
    /**
     * Sets a property associated with this object.
     * @param {string} name   the name of the property to set
     * @param {string} value  the new value of the property
     */
    HomeObject.prototype.setProperty = function (name, value) {
        if (value == null) {
            if (this.properties != null && this.properties.hasOwnProperty(name)) {
                /* remove */ delete this.properties[name];
                if (Object.keys(this.properties).length === 0) {
                    this.properties = null;
                }
            }
        }
        else {
            if (this.properties == null) {
                this.properties = (function (k) { var o = {}; o[k] = value; return o; })(name);
            }
            else {
                if (Object.keys(this.properties).length === 1) {
                    this.properties = ({});
                }
                /* put */ (this.properties[name] = value);
            }
        }
    };
    /**
     * Returns the property names.
     * @return {Array} a collection of all the names of the properties set with {@link #setProperty(String, String) setProperty}
     */
    HomeObject.prototype.getPropertyNames = function () {
        if (this.properties != null) {
            return Object.keys(this.properties);
        }
        else {
            return [];
        }
    };
    /**
     * Returns a clone of this object.
     * @return {HomeObject}
     */
    HomeObject.prototype.clone = function () {
        var _this = this;
        try {
            var clone = (function (o) { var clone = Object.create(o); for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone[p] = o[p];
            } return clone; })(this);
            if (this.properties != null) {
                clone.properties = Object.keys(clone.properties).length === 1 ? (function (k) { var o = {}; o[k] = (function (a) { var i = 0; return { next: function () { return i < a.length ? a[i++] : null; }, hasNext: function () { return i < a.length; } }; })(/* values */ (function (obj) { return Object.keys(obj).map(function (key) { return obj[key]; }); })(_this.properties)).next(); return o; })(/* iterator */ (function (a) { var i = 0; return { next: function () { return i < a.length ? a[i++] : null; }, hasNext: function () { return i < a.length; } }; })(/* keySet */ Object.keys(this.properties)).next()) : ({});
            }
            return clone;
        }
        catch (ex) {
            throw new IllegalStateException("Super class isn\'t cloneable");
        }
        ;
    };
    return HomeObject;
}());
HomeObject["__class"] = "HomeObject";
HomeObject["__interfaces"] = ["java.lang.Cloneable", "java.io.Serializable"];
/**
 * Create a print attributes for home from the given parameters.
 * @param {HomePrint.PaperOrientation} paperOrientation
 * @param {number} paperWidth
 * @param {number} paperHeight
 * @param {number} paperTopMargin
 * @param {number} paperLeftMargin
 * @param {number} paperBottomMargin
 * @param {number} paperRightMargin
 * @param {boolean} furniturePrinted
 * @param {boolean} planPrinted
 * @param {boolean} view3DPrinted
 * @param {number} planScale
 * @param {string} headerFormat
 * @param {string} footerFormat
 * @class
 */
var HomePrint = (function () {
    function HomePrint(paperOrientation, paperWidth, paperHeight, paperTopMargin, paperLeftMargin, paperBottomMargin, paperRightMargin, furniturePrinted, planPrinted, view3DPrinted, planScale, headerFormat, footerFormat) {
        this.paperOrientation = null;
        this.paperWidth = 0;
        this.paperHeight = 0;
        this.paperTopMargin = 0;
        this.paperLeftMargin = 0;
        this.paperBottomMargin = 0;
        this.paperRightMargin = 0;
        this.furniturePrinted = false;
        this.planPrinted = false;
        this.view3DPrinted = false;
        this.planScale = null;
        this.headerFormat = null;
        this.footerFormat = null;
        this.paperOrientation = paperOrientation;
        this.paperWidth = paperWidth;
        this.paperHeight = paperHeight;
        this.paperTopMargin = paperTopMargin;
        this.paperLeftMargin = paperLeftMargin;
        this.paperBottomMargin = paperBottomMargin;
        this.paperRightMargin = paperRightMargin;
        this.furniturePrinted = furniturePrinted;
        this.planPrinted = planPrinted;
        this.view3DPrinted = view3DPrinted;
        this.planScale = planScale;
        this.headerFormat = headerFormat;
        this.footerFormat = footerFormat;
    }
    /**
     * Returns the paper orientation.
     * @return {HomePrint.PaperOrientation}
     */
    HomePrint.prototype.getPaperOrientation = function () {
        return this.paperOrientation;
    };
    /**
     * Returns the margin at paper bottom in 1/72nds of an inch.
     * @return {number}
     */
    HomePrint.prototype.getPaperBottomMargin = function () {
        return this.paperBottomMargin;
    };
    /**
     * Returns the paper height in 1/72nds of an inch.
     * @return {number}
     */
    HomePrint.prototype.getPaperHeight = function () {
        return this.paperHeight;
    };
    /**
     * Returns the margin at paper left in 1/72nds of an inch.
     * @return {number}
     */
    HomePrint.prototype.getPaperLeftMargin = function () {
        return this.paperLeftMargin;
    };
    /**
     * Returns the margin at paper right in 1/72nds of an inch.
     * @return {number}
     */
    HomePrint.prototype.getPaperRightMargin = function () {
        return this.paperRightMargin;
    };
    /**
     * Returns the margin at paper top in 1/72nds of an inch.
     * @return {number}
     */
    HomePrint.prototype.getPaperTopMargin = function () {
        return this.paperTopMargin;
    };
    /**
     * Returns the paper width in 1/72nds of an inch.
     * @return {number}
     */
    HomePrint.prototype.getPaperWidth = function () {
        return this.paperWidth;
    };
    /**
     * Returns whether home furniture should be printed or not.
     * @return {boolean}
     */
    HomePrint.prototype.isFurniturePrinted = function () {
        return this.furniturePrinted;
    };
    /**
     * Returns whether home plan should be printed or not.
     * @return {boolean}
     */
    HomePrint.prototype.isPlanPrinted = function () {
        return this.planPrinted;
    };
    /**
     * Returns whether home 3D view should be printed or not.
     * @return {boolean}
     */
    HomePrint.prototype.isView3DPrinted = function () {
        return this.view3DPrinted;
    };
    /**
     * Returns the scale used to print home plan or
     * <code>null</code> if no special scale is desired.
     * @return {number}
     */
    HomePrint.prototype.getPlanScale = function () {
        return this.planScale;
    };
    /**
     * Returns the string format used to print page headers.
     * @return {string}
     */
    HomePrint.prototype.getHeaderFormat = function () {
        return this.headerFormat;
    };
    /**
     * Returns the string format used to print page footers.
     * @return {string}
     */
    HomePrint.prototype.getFooterFormat = function () {
        return this.footerFormat;
    };
    return HomePrint;
}());
HomePrint["__class"] = "HomePrint";
HomePrint["__interfaces"] = ["java.io.Serializable"];
(function (HomePrint) {
    /**
     * Paper orientation.
     * @enum
     */
    var PaperOrientation;
    (function (PaperOrientation) {
        PaperOrientation[PaperOrientation["PORTRAIT"] = 0] = "PORTRAIT";
        PaperOrientation[PaperOrientation["LANDSCAPE"] = 1] = "LANDSCAPE";
        PaperOrientation[PaperOrientation["REVERSE_LANDSCAPE"] = 2] = "REVERSE_LANDSCAPE";
    })(PaperOrientation = HomePrint.PaperOrientation || (HomePrint.PaperOrientation = {}));
})(HomePrint || (HomePrint = {}));
var HomeRecorder;
(function (HomeRecorder) {
    /**
     * Recorder type used as a hint to select a home recorder.
     * @since 1.8
     * @enum
     */
    var Type;
    (function (Type) {
        Type[Type["DEFAULT"] = 0] = "DEFAULT";
        Type[Type["COMPRESSED"] = 1] = "COMPRESSED";
    })(Type = HomeRecorder.Type || (HomeRecorder.Type = {}));
})(HomeRecorder || (HomeRecorder = {}));
/**
 * Creates a home texture from an existing one with customized angle and offset.
 * @param {TextureImage} texture the texture from which data are copied
 * @param {number} angle   the rotation angle applied to the texture
 * @param {boolean} leftToRightOriented orientation used on the texture when applied on objects seen from front
 * @since 5.3
 * @class
 */
var HomeTexture = (function () {
    function HomeTexture(texture, angle, leftToRightOriented) {
        var _this = this;
        if (((texture != null && (texture["__interfaces"] != null && texture["__interfaces"].indexOf("com.eteks.sweethome3d.model.TextureImage") >= 0 || texture.constructor != null && texture.constructor["__interfaces"] != null && texture.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.TextureImage") >= 0)) || texture === null) && ((typeof angle === 'number') || angle === null) && ((typeof leftToRightOriented === 'boolean') || leftToRightOriented === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.catalogId = null;
            this.name = null;
            this.image = null;
            this.width = 0;
            this.height = 0;
            this.angle = 0;
            this.leftToRightOriented = false;
            this.catalogId = null;
            this.name = null;
            this.image = null;
            this.width = 0;
            this.height = 0;
            this.angle = 0;
            this.leftToRightOriented = false;
            (function () {
                _this.name = texture.getName();
                _this.image = texture.getImage();
                _this.width = texture.getWidth();
                _this.height = texture.getHeight();
                _this.angle = angle;
                _this.leftToRightOriented = leftToRightOriented;
                if (texture != null && texture instanceof HomeTexture) {
                    _this.catalogId = texture.getCatalogId();
                }
                else if (texture != null && texture instanceof CatalogTexture) {
                    _this.catalogId = texture.getId();
                }
                else {
                    _this.catalogId = null;
                }
            })();
        }
        else if (((texture != null && (texture["__interfaces"] != null && texture["__interfaces"].indexOf("com.eteks.sweethome3d.model.TextureImage") >= 0 || texture.constructor != null && texture.constructor["__interfaces"] != null && texture.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.TextureImage") >= 0)) || texture === null) && ((typeof angle === 'number') || angle === null) && leftToRightOriented === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_15 = Array.prototype.slice.call(arguments);
                var leftToRightOriented_1 = true;
                this.catalogId = null;
                this.name = null;
                this.image = null;
                this.width = 0;
                this.height = 0;
                this.angle = 0;
                this.leftToRightOriented = false;
                this.catalogId = null;
                this.name = null;
                this.image = null;
                this.width = 0;
                this.height = 0;
                this.angle = 0;
                this.leftToRightOriented = false;
                (function () {
                    _this.name = texture.getName();
                    _this.image = texture.getImage();
                    _this.width = texture.getWidth();
                    _this.height = texture.getHeight();
                    _this.angle = angle;
                    _this.leftToRightOriented = leftToRightOriented_1;
                    if (texture != null && texture instanceof HomeTexture) {
                        _this.catalogId = texture.getCatalogId();
                    }
                    else if (texture != null && texture instanceof CatalogTexture) {
                        _this.catalogId = texture.getId();
                    }
                    else {
                        _this.catalogId = null;
                    }
                })();
            }
        }
        else if (((texture != null && (texture["__interfaces"] != null && texture["__interfaces"].indexOf("com.eteks.sweethome3d.model.TextureImage") >= 0 || texture.constructor != null && texture.constructor["__interfaces"] != null && texture.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.TextureImage") >= 0)) || texture === null) && angle === undefined && leftToRightOriented === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_16 = Array.prototype.slice.call(arguments);
                var angle_1 = 0;
                {
                    var __args_17 = Array.prototype.slice.call(arguments);
                    var leftToRightOriented_2 = true;
                    this.catalogId = null;
                    this.name = null;
                    this.image = null;
                    this.width = 0;
                    this.height = 0;
                    this.angle = 0;
                    this.leftToRightOriented = false;
                    this.catalogId = null;
                    this.name = null;
                    this.image = null;
                    this.width = 0;
                    this.height = 0;
                    this.angle = 0;
                    this.leftToRightOriented = false;
                    (function () {
                        _this.name = texture.getName();
                        _this.image = texture.getImage();
                        _this.width = texture.getWidth();
                        _this.height = texture.getHeight();
                        _this.angle = angle_1;
                        _this.leftToRightOriented = leftToRightOriented_2;
                        if (texture != null && texture instanceof HomeTexture) {
                            _this.catalogId = texture.getCatalogId();
                        }
                        else if (texture != null && texture instanceof CatalogTexture) {
                            _this.catalogId = texture.getId();
                        }
                        else {
                            _this.catalogId = null;
                        }
                    })();
                }
            }
        }
        else
            throw new Error('invalid overload');
    }
    /**
     * Returns the catalog ID of this texture or <code>null</code> if it doesn't exist.
     * @since 4.4
     * @return {string}
     */
    HomeTexture.prototype.getCatalogId = function () {
        return this.catalogId;
    };
    /**
     * Returns the name of this texture.
     * @return {string}
     */
    HomeTexture.prototype.getName = function () {
        return this.name;
    };
    /**
     * Returns the content of the image used for this texture.
     * @return {Content}
     */
    HomeTexture.prototype.getImage = function () {
        return this.image;
    };
    /**
     * Returns the width of the image in centimeters.
     * @return {number}
     */
    HomeTexture.prototype.getWidth = function () {
        return this.width;
    };
    /**
     * Returns the height of the image in centimeters.
     * @return {number}
     */
    HomeTexture.prototype.getHeight = function () {
        return this.height;
    };
    /**
     * Returns the angle of rotation in radians applied to this texture.
     * @since 4.4
     * @return {number}
     */
    HomeTexture.prototype.getAngle = function () {
        return this.angle;
    };
    /**
     * Returns <code>true</code> if the objects using this texture should take into account
     * the orientation of the texture.
     * @since 3.4
     * @return {boolean}
     */
    HomeTexture.prototype.isLeftToRightOriented = function () {
        return this.leftToRightOriented;
    };
    /**
     * Returns <code>true</code> if the object in parameter is equal to this texture.
     * @param {*} obj
     * @return {boolean}
     */
    HomeTexture.prototype.equals = function (obj) {
        if (obj === this) {
            return true;
        }
        else if (obj != null && obj instanceof HomeTexture) {
            var texture = obj;
            return (texture.name === this.name || texture.name != null && (texture.name === this.name)) && (texture.image === this.image || texture.image != null && (function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(texture.image, this.image)) && texture.width === this.width && texture.height === this.height && texture.leftToRightOriented === this.leftToRightOriented && texture.angle === this.angle;
        }
        else {
            return false;
        }
    };
    return HomeTexture;
}());
HomeTexture["__class"] = "HomeTexture";
HomeTexture["__interfaces"] = ["com.eteks.sweethome3d.model.TextureImage", "java.io.Serializable"];
/**
 * Creates a <code>IllegalHomonymException</code> with its message.
 * @param {string} s
 * @class
 */
var IllegalHomonymException = (function () {
    function IllegalHomonymException(s) {
        if (((typeof s === 'string') || s === null)) {
            var __args = Array.prototype.slice.call(arguments);
        }
        else if (s === undefined) {
            var __args = Array.prototype.slice.call(arguments);
        }
        else
            throw new Error('invalid overload');
    }
    return IllegalHomonymException;
}());
IllegalHomonymException["__class"] = "IllegalHomonymException";
IllegalHomonymException["__interfaces"] = ["java.io.Serializable"];
/**
 * Creates a new light source.
 * @since 3.0
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} color
 * @param {number} diameter
 * @class
 */
var LightSource = (function () {
    function LightSource(x, y, z, color, diameter) {
        var _this = this;
        if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof z === 'number') || z === null) && ((typeof color === 'number') || color === null) && ((typeof diameter === 'number') || diameter === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.color = 0;
            this.diameter = null;
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.color = 0;
            this.diameter = null;
            (function () {
                _this.x = x;
                _this.y = y;
                _this.z = z;
                _this.color = color;
                _this.diameter = diameter;
            })();
        }
        else if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof z === 'number') || z === null) && ((typeof color === 'number') || color === null) && diameter === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_18 = Array.prototype.slice.call(arguments);
                var diameter_1 = null;
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.color = 0;
                this.diameter = null;
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.color = 0;
                this.diameter = null;
                (function () {
                    _this.x = x;
                    _this.y = y;
                    _this.z = z;
                    _this.color = color;
                    _this.diameter = diameter_1;
                })();
            }
        }
        else
            throw new Error('invalid overload');
    }
    /**
     * Returns the abscissa of this source.
     * @return {number}
     */
    LightSource.prototype.getX = function () {
        return this.x;
    };
    /**
     * Returns the ordinate of this source.
     * @return {number}
     */
    LightSource.prototype.getY = function () {
        return this.y;
    };
    /**
     * Returns the elevation of this source.
     * @return {number}
     */
    LightSource.prototype.getZ = function () {
        return this.z;
    };
    /**
     * Returns the RGB color code of this source.
     * @return {number}
     */
    LightSource.prototype.getColor = function () {
        return this.color;
    };
    /**
     * Returns the diameter of this source or <code>null</code> if it's not defined.
     * @since 3.0
     * @return {number}
     */
    LightSource.prototype.getDiameter = function () {
        return this.diameter;
    };
    return LightSource;
}());
LightSource["__class"] = "LightSource";
LightSource["__interfaces"] = ["java.io.Serializable"];
/**
 * Creates a patterns catalog.
 * @param {Array} patterns
 * @class
 */
var PatternsCatalog = (function () {
    function PatternsCatalog(patterns) {
        this.patterns = null;
        this.patterns = (patterns.slice(0));
    }
    /**
     * Returns the patterns list.
     * @return {Array} an unmodifiable list of furniture.
     */
    PatternsCatalog.prototype.getPatterns = function () {
        return this.patterns.slice(0);
    };
    /**
     * Returns the count of patterns in this category.
     * @return {number}
     */
    PatternsCatalog.prototype.getPatternsCount = function () {
        return this.patterns.length;
    };
    /**
     * Returns the pattern at a given <code>index</code>.
     * @param {number} index
     * @return {TextureImage}
     */
    PatternsCatalog.prototype.getPattern$int = function (index) {
        return this.patterns[index];
    };
    /**
     * Returns the pattern with a given <code>name</code>.
     * @throws IllegalArgumentException if no pattern with the given <code>name</code> exists
     * @param {string} name
     * @return {TextureImage}
     */
    PatternsCatalog.prototype.getPattern$java_lang_String = function (name) {
        for (var index133 = 0; index133 < this.patterns.length; index133++) {
            var pattern = this.patterns[index133];
            {
                if ((name === pattern.getName())) {
                    return pattern;
                }
            }
        }
        throw new IllegalArgumentException("No pattern with name " + name);
    };
    /**
     * Returns the pattern with a given <code>name</code>.
     * @throws IllegalArgumentException if no pattern with the given <code>name</code> exists
     * @param {string} name
     * @return {TextureImage}
     */
    PatternsCatalog.prototype.getPattern = function (name) {
        if (((typeof name === 'string') || name === null)) {
            return this.getPattern$java_lang_String(name);
        }
        else if (((typeof name === 'number') || name === null)) {
            return this.getPattern$int(name);
        }
        else
            throw new Error('invalid overload');
    };
    return PatternsCatalog;
}());
PatternsCatalog["__class"] = "PatternsCatalog";
/**
 * Creates a <code>RecorderException</code> with its message
 * and the internal cause that initiated this exception.
 * @param {string} message
 * @param {Error} cause
 * @class
 */
var RecorderException = (function (_super) {
    __extends(RecorderException, _super);
    function RecorderException(message, cause) {
        var _this = this;
        if (((typeof message === 'string') || message === null) && ((cause != null && (cause["__class"] == "java.lang.Throwable")) || cause === null)) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this, message) || this;
            _this.message = message;
        }
        else if (((typeof message === 'string') || message === null) && cause === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this, message) || this;
            _this.message = message;
        }
        else if (message === undefined && cause === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this) || this;
        }
        else
            throw new Error('invalid overload');
        return _this;
    }
    return RecorderException;
}(Error));
RecorderException["__class"] = "RecorderException";
RecorderException["__interfaces"] = ["java.io.Serializable"];
/**
 * Creates a window sash.
 * @param {number} xAxis
 * @param {number} yAxis
 * @param {number} width
 * @param {number} startAngle
 * @param {number} endAngle
 * @class
 */
var Sash = (function () {
    function Sash(xAxis, yAxis, width, startAngle, endAngle) {
        this.xAxis = 0;
        this.yAxis = 0;
        this.width = 0;
        this.startAngle = 0;
        this.endAngle = 0;
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        this.width = width;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }
    /**
     * Returns the abscissa of the axis around which this sash turns, relatively to
     * the top left corner of the window or the door.
     * @return {number} a value in percentage of the width of the door or the window.
     */
    Sash.prototype.getXAxis = function () {
        return this.xAxis;
    };
    /**
     * Returns the ordinate of the axis around which this sash turns, relatively to
     * the top left corner of the window or the door.
     * @return {number} a value in percentage of the depth of the door or the window.
     */
    Sash.prototype.getYAxis = function () {
        return this.yAxis;
    };
    /**
     * Returns the width of this sash.
     * @return {number} a value in percentage of the width of the door or the window.
     */
    Sash.prototype.getWidth = function () {
        return this.width;
    };
    /**
     * Returns the opening start angle of this sash.
     * @return {number} an angle in radians.
     */
    Sash.prototype.getStartAngle = function () {
        return this.startAngle;
    };
    /**
     * Returns the opening end angle of this sash.
     * @return {number} an angle in radians.
     */
    Sash.prototype.getEndAngle = function () {
        return this.endAngle;
    };
    return Sash;
}());
Sash["__class"] = "Sash";
Sash["__interfaces"] = ["java.io.Serializable"];
/**
 * Creates an event with an associated list of selected items.
 * @param {*} source
 * @param {Array} selectedItems
 * @class
 */
var SelectionEvent = (function () {
    function SelectionEvent(source, selectedItems) {
        this.selectedItems = null;
        this.selectedItems = selectedItems;
    }
    /**
     * Returns the selected items.
     * @return {Array}
     */
    SelectionEvent.prototype.getSelectedItems = function () {
        return this.selectedItems;
    };
    return SelectionEvent;
}());
SelectionEvent["__class"] = "SelectionEvent";
SelectionEvent["__interfaces"] = ["java.io.Serializable"];
/**
 * The different attributes that defines a text style.
 * @author Emmanuel Puybaret
 */
var TextStyle = (function () {
    function TextStyle(fontName, fontSize, bold, italic, cached) {
        var _this = this;
        if (((typeof fontName === 'string') || fontName === null) && ((typeof fontSize === 'number') || fontSize === null) && ((typeof bold === 'boolean') || bold === null) && ((typeof italic === 'boolean') || italic === null) && ((typeof cached === 'boolean') || cached === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.fontName = null;
            this.fontSize = 0;
            this.bold = false;
            this.italic = false;
            this.fontName = null;
            this.fontSize = 0;
            this.bold = false;
            this.italic = false;
            (function () {
                _this.fontName = fontName;
                _this.fontSize = fontSize;
                _this.bold = bold;
                _this.italic = italic;
                if (cached) {
                    /* add */ TextStyle.textStylesCache_$LI$().push(_this);
                }
            })();
        }
        else if (((typeof fontName === 'string') || fontName === null) && ((typeof fontSize === 'number') || fontSize === null) && ((typeof bold === 'boolean') || bold === null) && ((typeof italic === 'boolean') || italic === null) && cached === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_19 = Array.prototype.slice.call(arguments);
                var cached_2 = true;
                this.fontName = null;
                this.fontSize = 0;
                this.bold = false;
                this.italic = false;
                this.fontName = null;
                this.fontSize = 0;
                this.bold = false;
                this.italic = false;
                (function () {
                    _this.fontName = fontName;
                    _this.fontSize = fontSize;
                    _this.bold = bold;
                    _this.italic = italic;
                    if (cached_2) {
                        /* add */ TextStyle.textStylesCache_$LI$().push(_this);
                    }
                })();
            }
        }
        else if (((typeof fontName === 'number') || fontName === null) && ((typeof fontSize === 'boolean') || fontSize === null) && ((typeof bold === 'boolean') || bold === null) && italic === undefined && cached === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var fontSize_1 = __args[0];
            var bold_1 = __args[1];
            var italic_1 = __args[2];
            {
                var __args_20 = Array.prototype.slice.call(arguments);
                var fontName_1 = null;
                {
                    var __args_21 = Array.prototype.slice.call(arguments);
                    var cached_3 = true;
                    this.fontName = null;
                    this.fontSize = 0;
                    this.bold = false;
                    this.italic = false;
                    this.fontName = null;
                    this.fontSize = 0;
                    this.bold = false;
                    this.italic = false;
                    (function () {
                        _this.fontName = fontName_1;
                        _this.fontSize = fontSize_1;
                        _this.bold = bold_1;
                        _this.italic = italic_1;
                        if (cached_3) {
                            /* add */ TextStyle.textStylesCache_$LI$().push(_this);
                        }
                    })();
                }
            }
        }
        else if (((typeof fontName === 'number') || fontName === null) && fontSize === undefined && bold === undefined && italic === undefined && cached === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var fontSize_2 = __args[0];
            {
                var __args_22 = Array.prototype.slice.call(arguments);
                var bold_2 = false;
                var italic_2 = false;
                {
                    var __args_23 = Array.prototype.slice.call(arguments);
                    var fontName_2 = null;
                    {
                        var __args_24 = Array.prototype.slice.call(arguments);
                        var cached_4 = true;
                        this.fontName = null;
                        this.fontSize = 0;
                        this.bold = false;
                        this.italic = false;
                        this.fontName = null;
                        this.fontSize = 0;
                        this.bold = false;
                        this.italic = false;
                        (function () {
                            _this.fontName = fontName_2;
                            _this.fontSize = fontSize_2;
                            _this.bold = bold_2;
                            _this.italic = italic_2;
                            if (cached_4) {
                                /* add */ TextStyle.textStylesCache_$LI$().push(_this);
                            }
                        })();
                    }
                }
            }
        }
        else
            throw new Error('invalid overload');
    }
    TextStyle.textStylesCache_$LI$ = function () { if (TextStyle.textStylesCache == null)
        TextStyle.textStylesCache = ([]); return TextStyle.textStylesCache; };
    ;
    /**
     * Returns the text style instance matching the given parameters.
     * @param {string} fontName
     * @param {number} fontSize
     * @param {boolean} bold
     * @param {boolean} italic
     * @return {TextStyle}
     * @private
     */
    TextStyle.prototype.getInstance = function (fontName, fontSize, bold, italic) {
        var textStyle = new TextStyle(fontName, fontSize, bold, italic, false);
        for (var i = TextStyle.textStylesCache_$LI$().length - 1; i >= 0; i--) {
            var cachedTextStyle = TextStyle.textStylesCache_$LI$()[i];
            if (cachedTextStyle == null) {
                /* remove */ TextStyle.textStylesCache_$LI$().splice(i, 1);
            }
            else if ((function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(cachedTextStyle, textStyle)) {
                return textStyle;
            }
        }
        /* add */ TextStyle.textStylesCache_$LI$().push(textStyle);
        return textStyle;
    };
    /**
     * Returns the font name of this text style.
     * @return {string}
     */
    TextStyle.prototype.getFontName = function () {
        return this.fontName;
    };
    /**
     * Returns the font size of this text style.
     * @return {number}
     */
    TextStyle.prototype.getFontSize = function () {
        return this.fontSize;
    };
    /**
     * Returns whether this text style is bold or not.
     * @return {boolean}
     */
    TextStyle.prototype.isBold = function () {
        return this.bold;
    };
    /**
     * Returns whether this text style is italic or not.
     * @return {boolean}
     */
    TextStyle.prototype.isItalic = function () {
        return this.italic;
    };
    /**
     * Returns a derived style of this text style with a given font name.
     * @since 5.0
     * @param {string} fontName
     * @return {TextStyle}
     */
    TextStyle.prototype.deriveStyle$java_lang_String = function (fontName) {
        if (this.getFontName() === fontName || (fontName != null && (fontName === this.getFontName()))) {
            return this;
        }
        else {
            return this.getInstance(fontName, this.getFontSize(), this.isBold(), this.isItalic());
        }
    };
    /**
     * Returns a derived style of this text style with a given font name.
     * @since 5.0
     * @param {string} fontName
     * @return {TextStyle}
     */
    TextStyle.prototype.deriveStyle = function (fontName) {
        if (((typeof fontName === 'string') || fontName === null)) {
            return this.deriveStyle$java_lang_String(fontName);
        }
        else if (((typeof fontName === 'number') || fontName === null)) {
            return this.deriveStyle$float(fontName);
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Returns a derived style of this text style with a given font size.
     * @param {number} fontSize
     * @return {TextStyle}
     */
    TextStyle.prototype.deriveStyle$float = function (fontSize) {
        if (this.getFontSize() === fontSize) {
            return this;
        }
        else {
            return this.getInstance(this.getFontName(), fontSize, this.isBold(), this.isItalic());
        }
    };
    /**
     * Returns a derived style of this text style with a given bold style.
     * @param {boolean} bold
     * @return {TextStyle}
     */
    TextStyle.prototype.deriveBoldStyle = function (bold) {
        if (this.isBold() === bold) {
            return this;
        }
        else {
            return this.getInstance(this.getFontName(), this.getFontSize(), bold, this.isItalic());
        }
    };
    /**
     * Returns a derived style of this text style with a given italic style.
     * @param {boolean} italic
     * @return {TextStyle}
     */
    TextStyle.prototype.deriveItalicStyle = function (italic) {
        if (this.isItalic() === italic) {
            return this;
        }
        else {
            return this.getInstance(this.getFontName(), this.getFontSize(), this.isBold(), italic);
        }
    };
    /**
     * Returns <code>true</code> if this text style is equal to <code>object</code>.
     * @param {*} object
     * @return {boolean}
     */
    TextStyle.prototype.equals = function (object) {
        if (object != null && object instanceof TextStyle) {
            var textStyle = object;
            return (textStyle.fontName === this.fontName || (textStyle.fontName != null && (textStyle.fontName === this.fontName))) && textStyle.fontSize === this.fontSize && textStyle.bold === this.bold && textStyle.italic === this.italic;
        }
        return false;
    };
    return TextStyle;
}());
TextStyle["__class"] = "TextStyle";
TextStyle["__interfaces"] = ["java.io.Serializable"];
/**
 * Textures catalog.
 * @author Emmanuel Puybaret
 */
var TexturesCatalog = (function () {
    function TexturesCatalog() {
        /*private*/ this.categories = ([]);
        /*private*/ this.texturesChangeSupport = (new CollectionChangeSupport(this));
    }
    /**
     * Returns the categories list sorted by name.
     * @return {Array} an unmodifiable list of categories.
     */
    TexturesCatalog.prototype.getCategories = function () {
        return this.categories.slice(0);
    };
    /**
     * Returns the count of categories in this catalog.
     * @return {number}
     */
    TexturesCatalog.prototype.getCategoriesCount = function () {
        return this.categories.length;
    };
    /**
     * Returns the category at a given <code>index</code>.
     * @param {number} index
     * @return {TexturesCategory}
     */
    TexturesCatalog.prototype.getCategory = function (index) {
        return this.categories[index];
    };
    /**
     * Adds the texture <code>listener</code> in parameter to this catalog.
     * @param {CollectionListener} listener
     */
    TexturesCatalog.prototype.addTexturesListener = function (listener) {
        this.texturesChangeSupport.addCollectionListener((listener));
    };
    /**
     * Removes the texture <code>listener</code> in parameter from this catalog.
     * @param {CollectionListener} listener
     */
    TexturesCatalog.prototype.removeTexturesListener = function (listener) {
        this.texturesChangeSupport.removeCollectionListener((listener));
    };
    /**
     * Adds <code>texture</code> of a given <code>category</code> to this catalog.
     * Once the <code>texture</code> is added, texture listeners added to this catalog will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged} notification.
     * @param {TexturesCategory} category the category of the texture.
     * @param {CatalogTexture} texture  a texture.
     */
    TexturesCatalog.prototype.add = function (category, texture) {
        var index = (function (l, key) { var comp = function (a, b) { return a.localeCompare(b); }; var low = 0; var high = l.length - 1; while (low <= high) {
            var mid = (low + high) >>> 1;
            var midVal = l[mid];
            var cmp = comp(midVal, key);
            if (cmp < 0)
                low = mid + 1;
            else if (cmp > 0)
                high = mid - 1;
            else
                return mid;
        } return -(low + 1); })(this.categories, category);
        if (index < 0) {
            category = new TexturesCategory(category.getName());
            /* add */ this.categories.splice(-index - 1, 0, category);
        }
        else {
            category = this.categories[index];
        }
        category.add(texture);
        this.texturesChangeSupport.fireCollectionChanged(texture, category.getIndexOfTexture(texture), CollectionEvent.Type.ADD);
    };
    /**
     * Deletes the <code>texture</code> from this catalog.
     * If then texture category is empty, it will be removed from the categories of this catalog.
     * Once the <code>texture</code> is deleted, texture listeners added to this catalog will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged} notification.
     * @param {CatalogTexture} texture a texture.
     */
    TexturesCatalog.prototype["delete"] = function (texture) {
        var category = texture.getCategory();
        if (category != null) {
            var textureIndex = category.getIndexOfTexture(texture);
            if (textureIndex >= 0) {
                category["delete"](texture);
                if (category.getTexturesCount() === 0) {
                    this.categories = (this.categories.slice(0));
                    /* remove */ (function (a) { return a.splice(a.indexOf(category), 1); })(this.categories);
                }
                this.texturesChangeSupport.fireCollectionChanged(texture, textureIndex, CollectionEvent.Type.DELETE);
                return;
            }
        }
        throw new IllegalArgumentException("catalog doesn\'t contain texture " + texture.getName());
    };
    return TexturesCatalog;
}());
TexturesCatalog["__class"] = "TexturesCatalog";
/**
 * Create a category.
 * @param {string} name the name of the category.
 * @class
 */
var TexturesCategory = (function () {
    function TexturesCategory(name) {
        this.name = null;
        this.textures = null;
        this.name = name;
        this.textures = ([]);
    }
    TexturesCategory.COMPARATOR_$LI$ = function () { if (TexturesCategory.COMPARATOR == null)
        TexturesCategory.COMPARATOR = (function (o1, o2) { return o1.toString().localeCompare(o2.toString()); }); return TexturesCategory.COMPARATOR; };
    ;
    /**
     * Returns the name of this category.
     * @return {string}
     */
    TexturesCategory.prototype.getName = function () {
        return this.name;
    };
    /**
     * Returns the textures list of this category sorted by name.
     * @return {Array} an unmodifiable list of furniture.
     */
    TexturesCategory.prototype.getTextures = function () {
        return this.textures.slice(0);
    };
    /**
     * Returns the count of textures in this category.
     * @return {number}
     */
    TexturesCategory.prototype.getTexturesCount = function () {
        return this.textures.length;
    };
    /**
     * Returns the texture at a given <code>index</code>.
     * @param {number} index
     * @return {CatalogTexture}
     */
    TexturesCategory.prototype.getTexture = function (index) {
        return this.textures[index];
    };
    /**
     * Returns the index of the given <code>texture</code>.
     * @since 3.6
     * @param {CatalogTexture} texture
     * @return {number}
     */
    TexturesCategory.prototype.getIndexOfTexture = function (texture) {
        return this.textures.indexOf(texture);
    };
    /**
     * Adds a texture to this category.
     * @param {CatalogTexture} texture the texture to add.
     */
    TexturesCategory.prototype.add = function (texture) {
        texture.setCategory(this);
        var index = (function (l, key) { var comp = function (a, b) { return a.localeCompare(b); }; var low = 0; var high = l.length - 1; while (low <= high) {
            var mid = (low + high) >>> 1;
            var midVal = l[mid];
            var cmp = comp(midVal, key);
            if (cmp < 0)
                low = mid + 1;
            else if (cmp > 0)
                high = mid - 1;
            else
                return mid;
        } return -(low + 1); })(this.textures, texture);
        if (index < 0) {
            index = -index - 1;
        }
        /* add */ this.textures.splice(index, 0, texture);
    };
    /**
     * Deletes a texture from this category.
     * @param {CatalogTexture} texture the texture to remove.
     * @throws IllegalArgumentException if the texture doesn't exist in this category.
     */
    TexturesCategory.prototype["delete"] = function (texture) {
        var textureIndex = this.textures.indexOf(texture);
        if (textureIndex === -1) {
            throw new IllegalArgumentException(this.name + " doesn\'t contain texture " + texture.getName());
        }
        this.textures = (this.textures.slice(0));
        /* remove */ this.textures.splice(textureIndex, 1);
    };
    /**
     * Returns true if this category and the one in parameter have the same name.
     * @param {*} obj
     * @return {boolean}
     */
    TexturesCategory.prototype.equals = function (obj) {
        return (obj != null && obj instanceof TexturesCategory) && (function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(TexturesCategory.COMPARATOR_$LI$(), this.name);
    };
    /**
     * Compares the names of this category and the one in parameter.
     * @param {TexturesCategory} category
     * @return {number}
     */
    TexturesCategory.prototype.compareTo = function (category) {
        return TexturesCategory.COMPARATOR_$LI$().compare(this.name, category.name);
    };
    return TexturesCategory;
}());
TexturesCategory["__class"] = "TexturesCategory";
TexturesCategory["__interfaces"] = ["java.lang.Comparable"];
/**
 * Creates the controller of home 3D view.
 * @param {Home} home the home edited by this controller and its view
 * @param {UserPreferences} preferences
 * @param {ViewFactory} viewFactory
 * @param {ContentManager} contentManager
 * @param {javax.swing.undo.UndoableEditSupport} undoSupport
 * @class
 */
var HomeController3D = (function () {
    function HomeController3D(home, preferences, viewFactory, contentManager, undoSupport) {
        this.home = null;
        this.preferences = null;
        this.viewFactory = null;
        this.contentManager = null;
        this.undoSupport = null;
        this.home3DView = null;
        this.topCameraState = null;
        this.observerCameraState = null;
        this.cameraState = null;
        this.home = home;
        this.preferences = preferences;
        this.viewFactory = viewFactory;
        this.contentManager = contentManager;
        this.undoSupport = undoSupport;
        this.topCameraState = new HomeController3D.TopCameraState(this, preferences);
        this.observerCameraState = new HomeController3D.ObserverCameraState(this);
        this.setCameraState(home.getCamera() === home.getTopCamera() ? this.topCameraState : this.observerCameraState);
        this.addModelListeners(home);
    }
    /**
     * Add listeners to model to update camera position accordingly.
     * @param {Home} home
     * @private
     */
    HomeController3D.prototype.addModelListeners = function (home) {
        home.addPropertyChangeListener("CAMERA", new HomeController3D.HomeController3D$0(this, home));
        var levelElevationChangeListener = new HomeController3D.HomeController3D$1(this, home);
        var selectedLevel = home.getSelectedLevel();
        if (selectedLevel != null) {
            selectedLevel.addPropertyChangeListener(levelElevationChangeListener);
        }
        home.addPropertyChangeListener("SELECTED_LEVEL", new HomeController3D.HomeController3D$2(this, home, levelElevationChangeListener));
        var selectedLevelListener = new HomeController3D.HomeController3D$3(this, home);
        home.addPropertyChangeListener("SELECTED_LEVEL", selectedLevelListener);
        home.getEnvironment().addPropertyChangeListener("ALL_LEVELS_VISIBLE", selectedLevelListener);
    };
    HomeController3D.prototype.getObserverCameraMinimumElevation = function (home) {
        var levels = home.getLevels();
        var minimumElevation = levels.length === 0 ? 10 : 10 + levels[0].getElevation();
        return minimumElevation;
    };
    /**
     * Returns the view associated with this controller.
     * @return {View}
     */
    HomeController3D.prototype.getView = function () {
        if (this.home3DView == null) {
            this.home3DView = this.viewFactory.createView3D(this.home, this.preferences, this);
        }
        return this.home3DView;
    };
    /**
     * Changes home camera for {@link Home#getTopCamera() top camera}.
     */
    HomeController3D.prototype.viewFromTop = function () {
        this.home.setCamera(this.home.getTopCamera());
    };
    /**
     * Changes home camera for {@link Home#getObserverCamera() observer camera}.
     */
    HomeController3D.prototype.viewFromObserver = function () {
        this.home.setCamera(this.home.getObserverCamera());
    };
    /**
     * Stores a clone of the current camera in home under the given <code>name</code>.
     * @param {string} name
     */
    HomeController3D.prototype.storeCamera = function (name) {
        var camera = (function (o) { if (o.clone != undefined) {
            return o.clone();
        }
        else {
            var clone = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone[p] = o[p];
            }
            return clone;
        } })(this.home.getCamera());
        camera.setName(name);
        var homeStoredCameras = this.home.getStoredCameras();
        var storedCameras = ([]);
        /* addAll */ (function (l1, l2) { return l1.push.apply(l1, l2); })(storedCameras, homeStoredCameras);
        for (var i = storedCameras.length - 1; i >= 0; i--) {
            var storedCamera = storedCameras[i];
            if ((name === storedCamera.getName()) || (camera.getX() === storedCamera.getX() && camera.getY() === storedCamera.getY() && camera.getZ() === storedCamera.getZ() && camera.getPitch() === storedCamera.getPitch() && camera.getYaw() === storedCamera.getYaw() && camera.getFieldOfView() === storedCamera.getFieldOfView() && camera.getTime() === storedCamera.getTime() && camera.getLens() === storedCamera.getLens())) {
                /* remove */ storedCameras.splice(i, 1);
            }
        }
        /* add */ storedCameras.splice(0, 0, camera);
        while ((storedCameras.length > this.preferences.getStoredCamerasMaxCount())) {
            /* remove */ storedCameras.splice(/* size */ storedCameras.length - 1, 1);
        }
        ;
        this.home.setStoredCameras(storedCameras);
    };
    /**
     * Switches to observer or top camera and move camera to the values as the current camera.
     * @param {Camera} camera
     */
    HomeController3D.prototype.goToCamera = function (camera) {
        if (camera != null && camera instanceof ObserverCamera) {
            this.viewFromObserver();
        }
        else {
            this.viewFromTop();
        }
        this.cameraState.goToCamera(camera);
        var storedCameras = (this.home.getStoredCameras().slice(0));
        /* remove */ (function (a) { return a.splice(a.indexOf(camera), 1); })(storedCameras);
        /* add */ storedCameras.splice(0, 0, camera);
        this.home.setStoredCameras(storedCameras);
    };
    /**
     * Deletes the given list of cameras from the ones stored in home.
     * @param {Array} cameras
     */
    HomeController3D.prototype.deleteCameras = function (cameras) {
        var homeStoredCameras = this.home.getStoredCameras();
        var storedCameras = ([]);
        for (var index134 = 0; index134 < homeStoredCameras.length; index134++) {
            var camera = homeStoredCameras[index134];
            {
                if (!(cameras.indexOf(camera) >= 0)) {
                    /* add */ storedCameras.push(camera);
                }
            }
        }
        this.home.setStoredCameras(storedCameras);
    };
    /**
     * Makes all levels visible.
     */
    HomeController3D.prototype.displayAllLevels = function () {
        this.home.getEnvironment().setAllLevelsVisible(true);
    };
    /**
     * Makes the selected level and below visible.
     */
    HomeController3D.prototype.displaySelectedLevel = function () {
        this.home.getEnvironment().setAllLevelsVisible(false);
    };
    /**
     * Changes current state of controller.
     * @param {HomeController3D.CameraControllerState} state
     */
    HomeController3D.prototype.setCameraState = function (state) {
        if (this.cameraState != null) {
            this.cameraState.exit();
        }
        this.cameraState = state;
        this.cameraState.enter();
    };
    /**
     * Moves home camera of <code>delta</code>.
     * @param {number} delta  the value in cm that the camera should move forward
     * (with a negative delta) or backward (with a positive delta)
     */
    HomeController3D.prototype.moveCamera = function (delta) {
        this.cameraState.moveCamera(delta);
    };
    /**
     * Moves home camera sideways of <code>delta</code>.
     * @param {number} delta  the value in cm that the camera should move left
     * (with a negative delta) or right (with a positive delta)
     * @since 4.4
     */
    HomeController3D.prototype.moveCameraSideways = function (delta) {
        this.cameraState.moveCameraSideways(delta);
    };
    /**
     * Elevates home camera of <code>delta</code>.
     * @param {number} delta the value in cm that the camera should move down
     * (with a negative delta) or up (with a positive delta)
     */
    HomeController3D.prototype.elevateCamera = function (delta) {
        this.cameraState.elevateCamera(delta);
    };
    /**
     * Rotates home camera yaw angle of <code>delta</code> radians.
     * @param {number} delta  the value in rad that the camera should turn around yaw axis
     */
    HomeController3D.prototype.rotateCameraYaw = function (delta) {
        this.cameraState.rotateCameraYaw(delta);
    };
    /**
     * Rotates home camera pitch angle of <code>delta</code> radians.
     * @param {number} delta  the value in rad that the camera should turn around pitch axis
     */
    HomeController3D.prototype.rotateCameraPitch = function (delta) {
        this.cameraState.rotateCameraPitch(delta);
    };
    /**
     * Returns the observer camera state.
     * @return {HomeController3D.CameraControllerState}
     */
    HomeController3D.prototype.getObserverCameraState = function () {
        return this.observerCameraState;
    };
    /**
     * Returns the top camera state.
     * @return {HomeController3D.CameraControllerState}
     */
    HomeController3D.prototype.getTopCameraState = function () {
        return this.topCameraState;
    };
    return HomeController3D;
}());
HomeController3D["__class"] = "HomeController3D";
HomeController3D["__interfaces"] = ["com.eteks.sweethome3d.viewcontroller.Controller"];
(function (HomeController3D) {
    /**
     * Controller state classes super class.
     */
    var CameraControllerState = (function () {
        function CameraControllerState() {
        }
        CameraControllerState.prototype.enter = function () {
        };
        CameraControllerState.prototype.exit = function () {
        };
        CameraControllerState.prototype.moveCamera = function (delta) {
        };
        CameraControllerState.prototype.moveCameraSideways = function (delta) {
        };
        CameraControllerState.prototype.elevateCamera = function (delta) {
        };
        CameraControllerState.prototype.rotateCameraYaw = function (delta) {
        };
        CameraControllerState.prototype.rotateCameraPitch = function (delta) {
        };
        CameraControllerState.prototype.goToCamera = function (camera) {
        };
        return CameraControllerState;
    }());
    HomeController3D.CameraControllerState = CameraControllerState;
    CameraControllerState["__class"] = "HomeController3D.CameraControllerState";
    /**
     * Top camera controller state.
     * @extends HomeController3D.CameraControllerState
     */
    var TopCameraState = (function (_super) {
        __extends(TopCameraState, _super);
        function TopCameraState(__parent, preferences) {
            var _this = _super.call(this) || this;
            _this.MIN_WIDTH = 100;
            _this.MIN_HEIGHT = 20;
            _this.__parent = __parent;
            _this.MIN_DEPTH = _this.MIN_WIDTH;
            _this.topCamera = null;
            _this.aerialViewBoundsLowerPoint = null;
            _this.aerialViewBoundsUpperPoint = null;
            _this.minDistanceToAerialViewCenter = 0;
            _this.maxDistanceToAerialViewCenter = 0;
            _this.aerialViewCenteredOnSelectionEnabled = false;
            _this.objectChangeListener = new TopCameraState.TopCameraState$0(_this);
            _this.levelsListener = function (ev) {
                if (ev.getType() === CollectionEvent.Type.ADD) {
                    ev.getItem().addPropertyChangeListener(_this.objectChangeListener);
                }
                else if (ev.getType() === CollectionEvent.Type.DELETE) {
                    ev.getItem().removePropertyChangeListener(_this.objectChangeListener);
                }
                _this.updateCameraFromHomeBounds(false);
            };
            _this.wallsListener = function (ev) {
                if (ev.getType() === CollectionEvent.Type.ADD) {
                    ev.getItem().addPropertyChangeListener(_this.objectChangeListener);
                }
                else if (ev.getType() === CollectionEvent.Type.DELETE) {
                    ev.getItem().removePropertyChangeListener(_this.objectChangeListener);
                }
                _this.updateCameraFromHomeBounds(false);
            };
            _this.furnitureListener = function (ev) {
                if (ev.getType() === CollectionEvent.Type.ADD) {
                    ev.getItem().addPropertyChangeListener(_this.objectChangeListener);
                    _this.updateCameraFromHomeBounds(/* size */ _this.__parent.home.getFurniture().length === 1 && (_this.__parent.home.getWalls().length == 0) && (_this.__parent.home.getRooms().length == 0));
                }
                else if (ev.getType() === CollectionEvent.Type.DELETE) {
                    ev.getItem().removePropertyChangeListener(_this.objectChangeListener);
                    _this.updateCameraFromHomeBounds(false);
                }
            };
            _this.roomsListener = function (ev) {
                if (ev.getType() === CollectionEvent.Type.ADD) {
                    ev.getItem().addPropertyChangeListener(_this.objectChangeListener);
                }
                else if (ev.getType() === CollectionEvent.Type.DELETE) {
                    ev.getItem().removePropertyChangeListener(_this.objectChangeListener);
                }
                _this.updateCameraFromHomeBounds(false);
            };
            _this.labelsListener = function (ev) {
                if (ev.getType() === CollectionEvent.Type.ADD) {
                    ev.getItem().addPropertyChangeListener(_this.objectChangeListener);
                }
                else if (ev.getType() === CollectionEvent.Type.DELETE) {
                    ev.getItem().removePropertyChangeListener(_this.objectChangeListener);
                }
                _this.updateCameraFromHomeBounds(false);
            };
            _this.selectionListener = new TopCameraState.TopCameraState$1(_this);
            _this.aerialViewCenteredOnSelectionEnabled = preferences.isAerialViewCenteredOnSelectionEnabled();
            preferences.addPropertyChangeListener("AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED", new HomeController3D.UserPreferencesChangeListener(_this));
            return _this;
        }
        TopCameraState.prototype.enter = function () {
            this.topCamera = this.__parent.home.getCamera();
            this.updateCameraFromHomeBounds(false);
            {
                var array136 = this.__parent.home.getLevels();
                for (var index135 = 0; index135 < array136.length; index135++) {
                    var level = array136[index135];
                    {
                        level.addPropertyChangeListener(this.objectChangeListener);
                    }
                }
            }
            this.__parent.home.addLevelsListener((this.levelsListener));
            {
                var array138 = this.__parent.home.getWalls();
                for (var index137 = 0; index137 < array138.length; index137++) {
                    var wall = array138[index137];
                    {
                        wall.addPropertyChangeListener(this.objectChangeListener);
                    }
                }
            }
            this.__parent.home.addWallsListener((this.wallsListener));
            {
                var array140 = this.__parent.home.getFurniture();
                for (var index139 = 0; index139 < array140.length; index139++) {
                    var piece = array140[index139];
                    {
                        piece.addPropertyChangeListener(this.objectChangeListener);
                    }
                }
            }
            this.__parent.home.addFurnitureListener((this.furnitureListener));
            {
                var array142 = this.__parent.home.getRooms();
                for (var index141 = 0; index141 < array142.length; index141++) {
                    var room = array142[index141];
                    {
                        room.addPropertyChangeListener(this.objectChangeListener);
                    }
                }
            }
            this.__parent.home.addRoomsListener((this.roomsListener));
            {
                var array144 = this.__parent.home.getLabels();
                for (var index143 = 0; index143 < array144.length; index143++) {
                    var label = array144[index143];
                    {
                        label.addPropertyChangeListener(this.objectChangeListener);
                    }
                }
            }
            this.__parent.home.addLabelsListener((this.labelsListener));
            this.__parent.home.addSelectionListener(this.selectionListener);
        };
        /**
         * Sets whether aerial view should be centered on selection or not.
         * @param {boolean} aerialViewCenteredOnSelectionEnabled
         */
        TopCameraState.prototype.setAerialViewCenteredOnSelectionEnabled = function (aerialViewCenteredOnSelectionEnabled) {
            this.aerialViewCenteredOnSelectionEnabled = aerialViewCenteredOnSelectionEnabled;
            this.updateCameraFromHomeBounds(false);
        };
        /**
         * Updates camera location from home bounds.
         * @param {boolean} firstPieceOfFurnitureAddedToEmptyHome
         * @private
         */
        TopCameraState.prototype.updateCameraFromHomeBounds = function (firstPieceOfFurnitureAddedToEmptyHome) {
            if (this.aerialViewBoundsLowerPoint == null) {
                this.updateAerialViewBoundsFromHomeBounds(this.aerialViewCenteredOnSelectionEnabled);
            }
            var distanceToCenter = this.getCameraToAerialViewCenterDistance();
            this.updateAerialViewBoundsFromHomeBounds(this.aerialViewCenteredOnSelectionEnabled);
            this.updateCameraIntervalToAerialViewCenter();
            this.placeCameraAt(distanceToCenter, firstPieceOfFurnitureAddedToEmptyHome);
        };
        /**
         * Returns the distance between the current camera location and home bounds center.
         * @return {number}
         * @private
         */
        TopCameraState.prototype.getCameraToAerialViewCenterDistance = function () {
            return (Math.fround ? (Math.sqrt(Math.pow((this.aerialViewBoundsLowerPoint[0] + this.aerialViewBoundsUpperPoint[0]) / 2 - this.topCamera.getX(), 2) + Math.pow((this.aerialViewBoundsLowerPoint[1] + this.aerialViewBoundsUpperPoint[1]) / 2 - this.topCamera.getY(), 2) + Math.pow((this.aerialViewBoundsLowerPoint[2] + this.aerialViewBoundsUpperPoint[2]) / 2 - this.topCamera.getZ(), 2))) : Math.fround(Math.sqrt(Math.pow((this.aerialViewBoundsLowerPoint[0] + this.aerialViewBoundsUpperPoint[0]) / 2 - this.topCamera.getX(), 2) + Math.pow((this.aerialViewBoundsLowerPoint[1] + this.aerialViewBoundsUpperPoint[1]) / 2 - this.topCamera.getY(), 2) + Math.pow((this.aerialViewBoundsLowerPoint[2] + this.aerialViewBoundsUpperPoint[2]) / 2 - this.topCamera.getZ(), 2))));
        };
        /**
         * Sets the bounds that includes walls, furniture and rooms, or only selected items
         * if <code>centerOnSelection</code> is <code>true</code>.
         * @param {boolean} centerOnSelection
         * @private
         */
        TopCameraState.prototype.updateAerialViewBoundsFromHomeBounds = function (centerOnSelection) {
            this.aerialViewBoundsLowerPoint = this.aerialViewBoundsUpperPoint = null;
            var selectedItems = [];
            if (centerOnSelection) {
                selectedItems = ([]);
                {
                    var array146 = this.__parent.home.getSelectedItems();
                    for (var index145 = 0; index145 < array146.length; index145++) {
                        var item = array146[index145];
                        {
                            if ((item != null && (item["__interfaces"] != null && item["__interfaces"].indexOf("com.eteks.sweethome3d.model.Elevatable") >= 0 || item.constructor != null && item.constructor["__interfaces"] != null && item.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Elevatable") >= 0)) && this.isItemAtVisibleLevel(item) && (!(item != null && item instanceof HomePieceOfFurniture) || item.isVisible()) && (!(item != null && item instanceof Label) || item.getPitch() != null)) {
                                /* add */ selectedItems.push(item);
                            }
                        }
                    }
                }
            }
            var selectionEmpty = selectedItems.length === 0 || !centerOnSelection;
            var containsVisibleWalls = false;
            {
                var array148 = selectionEmpty ? this.__parent.home.getWalls() : Home.getWallsSubList(selectedItems);
                for (var index147 = 0; index147 < array148.length; index147++) {
                    var wall = array148[index147];
                    {
                        if (this.isItemAtVisibleLevel(wall)) {
                            containsVisibleWalls = true;
                            var wallElevation = wall.getLevel() != null ? wall.getLevel().getElevation() : 0;
                            var minZ = selectionEmpty ? 0 : wallElevation;
                            var height = wall.getHeight();
                            var maxZ = void 0;
                            if (height != null) {
                                maxZ = wallElevation + height;
                            }
                            else {
                                maxZ = wallElevation + this.__parent.home.getWallHeight();
                            }
                            var heightAtEnd = wall.getHeightAtEnd();
                            if (heightAtEnd != null) {
                                maxZ = Math.max(maxZ, wallElevation + heightAtEnd);
                            }
                            {
                                var array150 = wall.getPoints();
                                for (var index149 = 0; index149 < array150.length; index149++) {
                                    var point = array150[index149];
                                    {
                                        this.updateAerialViewBounds(point[0], point[1], minZ, maxZ);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            {
                var array152 = selectionEmpty ? this.__parent.home.getFurniture() : Home.getFurnitureSubList(selectedItems);
                for (var index151 = 0; index151 < array152.length; index151++) {
                    var piece = array152[index151];
                    {
                        if (piece.isVisible() && this.isItemAtVisibleLevel(piece)) {
                            var minZ = void 0;
                            var maxZ = void 0;
                            if (selectionEmpty) {
                                minZ = Math.max(0, piece.getGroundElevation());
                                maxZ = Math.max(0, piece.getGroundElevation() + piece.getHeight());
                            }
                            else {
                                minZ = piece.getGroundElevation();
                                maxZ = piece.getGroundElevation() + piece.getHeight();
                            }
                            {
                                var array154 = piece.getPoints();
                                for (var index153 = 0; index153 < array154.length; index153++) {
                                    var point = array154[index153];
                                    {
                                        this.updateAerialViewBounds(point[0], point[1], minZ, maxZ);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            {
                var array156 = selectionEmpty ? this.__parent.home.getRooms() : Home.getRoomsSubList(selectedItems);
                for (var index155 = 0; index155 < array156.length; index155++) {
                    var room = array156[index155];
                    {
                        if (this.isItemAtVisibleLevel(room)) {
                            var minZ = 0;
                            var maxZ = this.MIN_HEIGHT;
                            var roomLevel = room.getLevel();
                            if (roomLevel != null) {
                                minZ = roomLevel.getElevation() - roomLevel.getFloorThickness();
                                maxZ = roomLevel.getElevation();
                                if (selectionEmpty) {
                                    minZ = Math.max(0, minZ);
                                    maxZ = Math.max(this.MIN_HEIGHT, roomLevel.getElevation());
                                }
                            }
                            {
                                var array158 = room.getPoints();
                                for (var index157 = 0; index157 < array158.length; index157++) {
                                    var point = array158[index157];
                                    {
                                        this.updateAerialViewBounds(point[0], point[1], minZ, maxZ);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            {
                var array160 = selectionEmpty ? this.__parent.home.getLabels() : Home.getLabelsSubList(selectedItems);
                for (var index159 = 0; index159 < array160.length; index159++) {
                    var label = array160[index159];
                    {
                        if (label.getPitch() != null && this.isItemAtVisibleLevel(label)) {
                            var minZ = void 0;
                            var maxZ = void 0;
                            if (selectionEmpty) {
                                minZ = Math.max(0, label.getGroundElevation());
                                maxZ = Math.max(this.MIN_HEIGHT, label.getGroundElevation());
                            }
                            else {
                                minZ = maxZ = label.getGroundElevation();
                            }
                            {
                                var array162 = label.getPoints();
                                for (var index161 = 0; index161 < array162.length; index161++) {
                                    var point = array162[index161];
                                    {
                                        this.updateAerialViewBounds(point[0], point[1], minZ, maxZ);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (this.aerialViewBoundsLowerPoint == null) {
                this.aerialViewBoundsLowerPoint = [0, 0, 0];
                this.aerialViewBoundsUpperPoint = [this.MIN_WIDTH, this.MIN_DEPTH, this.MIN_HEIGHT];
            }
            else if (containsVisibleWalls && selectionEmpty) {
                if (this.MIN_WIDTH > this.aerialViewBoundsUpperPoint[0] - this.aerialViewBoundsLowerPoint[0]) {
                    this.aerialViewBoundsLowerPoint[0] = (this.aerialViewBoundsLowerPoint[0] + this.aerialViewBoundsUpperPoint[0]) / 2 - this.MIN_WIDTH / 2;
                    this.aerialViewBoundsUpperPoint[0] = this.aerialViewBoundsLowerPoint[0] + this.MIN_WIDTH;
                }
                if (this.MIN_DEPTH > this.aerialViewBoundsUpperPoint[1] - this.aerialViewBoundsLowerPoint[1]) {
                    this.aerialViewBoundsLowerPoint[1] = (this.aerialViewBoundsLowerPoint[1] + this.aerialViewBoundsUpperPoint[1]) / 2 - this.MIN_DEPTH / 2;
                    this.aerialViewBoundsUpperPoint[1] = this.aerialViewBoundsLowerPoint[1] + this.MIN_DEPTH;
                }
                if (this.MIN_HEIGHT > this.aerialViewBoundsUpperPoint[2] - this.aerialViewBoundsLowerPoint[2]) {
                    this.aerialViewBoundsLowerPoint[2] = (this.aerialViewBoundsLowerPoint[2] + this.aerialViewBoundsUpperPoint[2]) / 2 - this.MIN_HEIGHT / 2;
                    this.aerialViewBoundsUpperPoint[2] = this.aerialViewBoundsLowerPoint[2] + this.MIN_HEIGHT;
                }
            }
        };
        /**
         * Adds the point at the given coordinates to aerial view bounds.
         * @param {number} x
         * @param {number} y
         * @param {number} minZ
         * @param {number} maxZ
         * @private
         */
        TopCameraState.prototype.updateAerialViewBounds = function (x, y, minZ, maxZ) {
            if (this.aerialViewBoundsLowerPoint == null) {
                this.aerialViewBoundsLowerPoint = [x, y, minZ];
                this.aerialViewBoundsUpperPoint = [x, y, maxZ];
            }
            else {
                this.aerialViewBoundsLowerPoint[0] = Math.min(this.aerialViewBoundsLowerPoint[0], x);
                this.aerialViewBoundsUpperPoint[0] = Math.max(this.aerialViewBoundsUpperPoint[0], x);
                this.aerialViewBoundsLowerPoint[1] = Math.min(this.aerialViewBoundsLowerPoint[1], y);
                this.aerialViewBoundsUpperPoint[1] = Math.max(this.aerialViewBoundsUpperPoint[1], y);
                this.aerialViewBoundsLowerPoint[2] = Math.min(this.aerialViewBoundsLowerPoint[2], minZ);
                this.aerialViewBoundsUpperPoint[2] = Math.max(this.aerialViewBoundsUpperPoint[2], maxZ);
            }
        };
        /**
         * Returns <code>true</code> if the given <code>item</code> is at a visible level.
         * @param {Elevatable} item
         * @return {boolean}
         * @private
         */
        TopCameraState.prototype.isItemAtVisibleLevel = function (item) {
            return item.getLevel() == null || item.getLevel().isViewableAndVisible();
        };
        /**
         * Updates the minimum and maximum distances of the camera to the center of the aerial view.
         * @private
         */
        TopCameraState.prototype.updateCameraIntervalToAerialViewCenter = function () {
            var homeBoundsWidth = this.aerialViewBoundsUpperPoint[0] - this.aerialViewBoundsLowerPoint[0];
            var homeBoundsDepth = this.aerialViewBoundsUpperPoint[1] - this.aerialViewBoundsLowerPoint[1];
            var homeBoundsHeight = this.aerialViewBoundsUpperPoint[2] - this.aerialViewBoundsLowerPoint[2];
            var halfDiagonal = (Math.fround ? (Math.sqrt(homeBoundsWidth * homeBoundsWidth + homeBoundsDepth * homeBoundsDepth + homeBoundsHeight * homeBoundsHeight)) : Math.fround(Math.sqrt(homeBoundsWidth * homeBoundsWidth + homeBoundsDepth * homeBoundsDepth + homeBoundsHeight * homeBoundsHeight))) / 2;
            this.minDistanceToAerialViewCenter = halfDiagonal * 1.05;
            this.maxDistanceToAerialViewCenter = Math.max(5 * this.minDistanceToAerialViewCenter, 2500);
        };
        TopCameraState.prototype.moveCamera = function (delta) {
            delta *= 5;
            var newDistanceToCenter = this.getCameraToAerialViewCenterDistance() - delta;
            this.placeCameraAt(newDistanceToCenter, false);
        };
        TopCameraState.prototype.placeCameraAt = function (distanceToCenter, firstPieceOfFurnitureAddedToEmptyHome) {
            distanceToCenter = Math.max(distanceToCenter, this.minDistanceToAerialViewCenter);
            distanceToCenter = Math.min(distanceToCenter, this.maxDistanceToAerialViewCenter);
            if (firstPieceOfFurnitureAddedToEmptyHome) {
                distanceToCenter = Math.min(distanceToCenter, 3 * this.minDistanceToAerialViewCenter);
            }
            var distanceToCenterAtGroundLevel = distanceToCenter * Math.cos(this.topCamera.getPitch());
            this.topCamera.setX((this.aerialViewBoundsLowerPoint[0] + this.aerialViewBoundsUpperPoint[0]) / 2 + (Math.fround ? ((Math.sin(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel)) : Math.fround((Math.sin(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel))));
            this.topCamera.setY((this.aerialViewBoundsLowerPoint[1] + this.aerialViewBoundsUpperPoint[1]) / 2 - (Math.fround ? ((Math.cos(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel)) : Math.fround((Math.cos(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel))));
            this.topCamera.setZ((this.aerialViewBoundsLowerPoint[2] + this.aerialViewBoundsUpperPoint[2]) / 2 + (Math.fround ? (Math.sin(this.topCamera.getPitch())) : Math.fround(Math.sin(this.topCamera.getPitch()))) * distanceToCenter);
        };
        TopCameraState.prototype.rotateCameraYaw = function (delta) {
            var newYaw = this.topCamera.getYaw() + delta;
            var distanceToCenterAtGroundLevel = this.getCameraToAerialViewCenterDistance() * Math.cos(this.topCamera.getPitch());
            this.topCamera.setYaw(newYaw);
            this.topCamera.setX((this.aerialViewBoundsLowerPoint[0] + this.aerialViewBoundsUpperPoint[0]) / 2 + (Math.fround ? ((Math.sin(newYaw) * distanceToCenterAtGroundLevel)) : Math.fround((Math.sin(newYaw) * distanceToCenterAtGroundLevel))));
            this.topCamera.setY((this.aerialViewBoundsLowerPoint[1] + this.aerialViewBoundsUpperPoint[1]) / 2 - (Math.fround ? ((Math.cos(newYaw) * distanceToCenterAtGroundLevel)) : Math.fround((Math.cos(newYaw) * distanceToCenterAtGroundLevel))));
        };
        TopCameraState.prototype.rotateCameraPitch = function (delta) {
            var newPitch = this.topCamera.getPitch() + delta;
            newPitch = Math.max(newPitch, 0);
            newPitch = Math.min(newPitch, (Math.fround ? (Math.PI) : Math.fround(Math.PI)) / 2);
            var distanceToCenter = this.getCameraToAerialViewCenterDistance();
            var distanceToCenterAtGroundLevel = distanceToCenter * Math.cos(newPitch);
            this.topCamera.setPitch(newPitch);
            this.topCamera.setX((this.aerialViewBoundsLowerPoint[0] + this.aerialViewBoundsUpperPoint[0]) / 2 + (Math.fround ? ((Math.sin(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel)) : Math.fround((Math.sin(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel))));
            this.topCamera.setY((this.aerialViewBoundsLowerPoint[1] + this.aerialViewBoundsUpperPoint[1]) / 2 - (Math.fround ? ((Math.cos(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel)) : Math.fround((Math.cos(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel))));
            this.topCamera.setZ((this.aerialViewBoundsLowerPoint[2] + this.aerialViewBoundsUpperPoint[2]) / 2 + (Math.fround ? ((distanceToCenter * Math.sin(newPitch))) : Math.fround((distanceToCenter * Math.sin(newPitch)))));
        };
        TopCameraState.prototype.goToCamera = function (camera) {
            this.topCamera.setCamera(camera);
            this.topCamera.setTime(camera.getTime());
            this.topCamera.setLens(camera.getLens());
            this.updateCameraFromHomeBounds(false);
        };
        TopCameraState.prototype.exit = function () {
            this.topCamera = null;
            {
                var array164 = this.__parent.home.getWalls();
                for (var index163 = 0; index163 < array164.length; index163++) {
                    var wall = array164[index163];
                    {
                        wall.removePropertyChangeListener(this.objectChangeListener);
                    }
                }
            }
            this.__parent.home.removeWallsListener((this.wallsListener));
            {
                var array166 = this.__parent.home.getFurniture();
                for (var index165 = 0; index165 < array166.length; index165++) {
                    var piece = array166[index165];
                    {
                        piece.removePropertyChangeListener(this.objectChangeListener);
                    }
                }
            }
            this.__parent.home.removeFurnitureListener((this.furnitureListener));
            {
                var array168 = this.__parent.home.getRooms();
                for (var index167 = 0; index167 < array168.length; index167++) {
                    var room = array168[index167];
                    {
                        room.removePropertyChangeListener(this.objectChangeListener);
                    }
                }
            }
            this.__parent.home.removeRoomsListener((this.roomsListener));
            {
                var array170 = this.__parent.home.getLabels();
                for (var index169 = 0; index169 < array170.length; index169++) {
                    var label = array170[index169];
                    {
                        label.removePropertyChangeListener(this.objectChangeListener);
                    }
                }
            }
            this.__parent.home.removeLabelsListener((this.labelsListener));
            {
                var array172 = this.__parent.home.getLevels();
                for (var index171 = 0; index171 < array172.length; index171++) {
                    var level = array172[index171];
                    {
                        level.removePropertyChangeListener(this.objectChangeListener);
                    }
                }
            }
            this.__parent.home.removeLevelsListener((this.levelsListener));
            this.__parent.home.removeSelectionListener(this.selectionListener);
        };
        return TopCameraState;
    }(HomeController3D.CameraControllerState));
    HomeController3D.TopCameraState = TopCameraState;
    TopCameraState["__class"] = "HomeController3D.TopCameraState";
    (function (TopCameraState) {
        var TopCameraState$0 = (function () {
            function TopCameraState$0(__parent) {
                this.__parent = __parent;
            }
            TopCameraState$0.prototype.propertyChange = function (ev) {
                this.__parent.updateCameraFromHomeBounds(false);
            };
            return TopCameraState$0;
        }());
        TopCameraState.TopCameraState$0 = TopCameraState$0;
        var TopCameraState$1 = (function () {
            function TopCameraState$1(__parent) {
                this.__parent = __parent;
            }
            TopCameraState$1.prototype.selectionChanged = function (ev) {
                this.__parent.updateCameraFromHomeBounds(false);
            };
            return TopCameraState$1;
        }());
        TopCameraState.TopCameraState$1 = TopCameraState$1;
    })(TopCameraState = HomeController3D.TopCameraState || (HomeController3D.TopCameraState = {}));
    /**
     * Preferences property listener bound to top camera state with a weak reference to avoid
     * strong link between user preferences and top camera state.
     */
    var UserPreferencesChangeListener = (function () {
        function UserPreferencesChangeListener(topCameraState) {
            this.topCameraState = null;
            this.topCameraState = (topCameraState);
        }
        UserPreferencesChangeListener.prototype.propertyChange = function (ev) {
            var topCameraState = this.topCameraState;
            var preferences = ev.getSource();
            if (topCameraState == null) {
                preferences.removePropertyChangeListener(/* valueOf */ ev.getPropertyName(), this);
            }
            else {
                topCameraState.setAerialViewCenteredOnSelectionEnabled(preferences.isAerialViewCenteredOnSelectionEnabled());
            }
        };
        return UserPreferencesChangeListener;
    }());
    HomeController3D.UserPreferencesChangeListener = UserPreferencesChangeListener;
    UserPreferencesChangeListener["__class"] = "HomeController3D.UserPreferencesChangeListener";
    UserPreferencesChangeListener["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
    /**
     * Observer camera controller state.
     * @extends HomeController3D.CameraControllerState
     */
    var ObserverCameraState = (function (_super) {
        __extends(ObserverCameraState, _super);
        function ObserverCameraState(__parent) {
            var _this = _super.call(this) || this;
            _this.__parent = __parent;
            _this.observerCamera = null;
            _this.levelElevationChangeListener = new ObserverCameraState.ObserverCameraState$0(_this);
            _this.levelsListener = function (ev) {
                if (ev.getType() === CollectionEvent.Type.ADD) {
                    ev.getItem().addPropertyChangeListener(_this.levelElevationChangeListener);
                }
                else if (ev.getType() === CollectionEvent.Type.DELETE) {
                    ev.getItem().removePropertyChangeListener(_this.levelElevationChangeListener);
                }
                _this.updateCameraMinimumElevation();
            };
            return _this;
        }
        ObserverCameraState.prototype.enter = function () {
            this.observerCamera = this.__parent.home.getCamera();
            {
                var array174 = this.__parent.home.getLevels();
                for (var index173 = 0; index173 < array174.length; index173++) {
                    var level = array174[index173];
                    {
                        level.addPropertyChangeListener(this.levelElevationChangeListener);
                    }
                }
            }
            this.__parent.home.addLevelsListener((this.levelsListener));
            this.__parent.home.setSelectedItems(/* asList */ [this.observerCamera].slice(0));
        };
        ObserverCameraState.prototype.moveCamera = function (delta) {
            this.observerCamera.setX(this.observerCamera.getX() - (Math.fround ? (Math.sin(this.observerCamera.getYaw())) : Math.fround(Math.sin(this.observerCamera.getYaw()))) * delta);
            this.observerCamera.setY(this.observerCamera.getY() + (Math.fround ? (Math.cos(this.observerCamera.getYaw())) : Math.fround(Math.cos(this.observerCamera.getYaw()))) * delta);
            this.__parent.home.setSelectedItems(/* asList */ [this.observerCamera].slice(0));
        };
        ObserverCameraState.prototype.moveCameraSideways = function (delta) {
            this.observerCamera.setX(this.observerCamera.getX() - (Math.fround ? (Math.cos(this.observerCamera.getYaw())) : Math.fround(Math.cos(this.observerCamera.getYaw()))) * delta);
            this.observerCamera.setY(this.observerCamera.getY() - (Math.fround ? (Math.sin(this.observerCamera.getYaw())) : Math.fround(Math.sin(this.observerCamera.getYaw()))) * delta);
            this.__parent.home.setSelectedItems(/* asList */ [this.observerCamera].slice(0));
        };
        ObserverCameraState.prototype.elevateCamera = function (delta) {
            var newElevation = this.observerCamera.getZ() + delta;
            newElevation = Math.min(Math.max(newElevation, this.getMinimumElevation()), this.__parent.preferences.getLengthUnit().getMaximumElevation());
            this.observerCamera.setZ(newElevation);
            this.__parent.home.setSelectedItems(/* asList */ [this.observerCamera].slice(0));
        };
        ObserverCameraState.prototype.updateCameraMinimumElevation = function () {
            this.observerCamera.setZ(Math.max(this.observerCamera.getZ(), this.getMinimumElevation()));
        };
        ObserverCameraState.prototype.getMinimumElevation = function () {
            var levels = this.__parent.home.getLevels();
            if (levels.length > 0) {
                return 10 + levels[0].getElevation();
            }
            else {
                return 10;
            }
        };
        ObserverCameraState.prototype.rotateCameraYaw = function (delta) {
            this.observerCamera.setYaw(this.observerCamera.getYaw() + delta);
            this.__parent.home.setSelectedItems(/* asList */ [this.observerCamera].slice(0));
        };
        ObserverCameraState.prototype.rotateCameraPitch = function (delta) {
            var newPitch = this.observerCamera.getPitch() + delta;
            newPitch = Math.max(newPitch, -(Math.fround ? (Math.PI) : Math.fround(Math.PI)) / 2);
            newPitch = Math.min(newPitch, (Math.fround ? (Math.PI) : Math.fround(Math.PI)) / 2);
            this.observerCamera.setPitch(newPitch);
            this.__parent.home.setSelectedItems(/* asList */ [this.observerCamera].slice(0));
        };
        ObserverCameraState.prototype.goToCamera = function (camera) {
            this.observerCamera.setCamera(camera);
            this.observerCamera.setTime(camera.getTime());
            this.observerCamera.setLens(camera.getLens());
        };
        ObserverCameraState.prototype.exit = function () {
            var _this = this;
            var selectedItems = this.__parent.home.getSelectedItems();
            if ((selectedItems.indexOf(this.observerCamera) >= 0)) {
                selectedItems = (selectedItems.slice(0));
                /* remove */ (function (a) { return a.splice(a.indexOf(_this.observerCamera), 1); })(selectedItems);
                this.__parent.home.setSelectedItems(selectedItems);
            }
            {
                var array176 = this.__parent.home.getLevels();
                for (var index175 = 0; index175 < array176.length; index175++) {
                    var level = array176[index175];
                    {
                        level.removePropertyChangeListener(this.levelElevationChangeListener);
                    }
                }
            }
            this.__parent.home.removeLevelsListener((this.levelsListener));
            this.observerCamera = null;
        };
        return ObserverCameraState;
    }(HomeController3D.CameraControllerState));
    HomeController3D.ObserverCameraState = ObserverCameraState;
    ObserverCameraState["__class"] = "HomeController3D.ObserverCameraState";
    (function (ObserverCameraState) {
        var ObserverCameraState$0 = (function () {
            function ObserverCameraState$0(__parent) {
                this.__parent = __parent;
            }
            ObserverCameraState$0.prototype.propertyChange = function (ev) {
                if (("ELEVATION" === ev.getPropertyName())) {
                    this.__parent.updateCameraMinimumElevation();
                }
            };
            return ObserverCameraState$0;
        }());
        ObserverCameraState.ObserverCameraState$0 = ObserverCameraState$0;
    })(ObserverCameraState = HomeController3D.ObserverCameraState || (HomeController3D.ObserverCameraState = {}));
    var HomeController3D$0 = (function () {
        function HomeController3D$0(__parent, home) {
            this.home = home;
            this.__parent = __parent;
        }
        HomeController3D$0.prototype.propertyChange = function (ev) {
            this.__parent.setCameraState(this.home.getCamera() === this.home.getTopCamera() ? this.__parent.topCameraState : this.__parent.observerCameraState);
        };
        return HomeController3D$0;
    }());
    HomeController3D.HomeController3D$0 = HomeController3D$0;
    var HomeController3D$1 = (function () {
        function HomeController3D$1(__parent, home) {
            this.home = home;
            this.__parent = __parent;
        }
        HomeController3D$1.prototype.propertyChange = function (ev) {
            if (("ELEVATION" === ev.getPropertyName()) && this.home.getEnvironment().isObserverCameraElevationAdjusted()) {
                this.home.getObserverCamera().setZ(Math.max(this.__parent.getObserverCameraMinimumElevation(this.home), this.home.getObserverCamera().getZ() + ev.getNewValue() - ev.getOldValue()));
            }
        };
        return HomeController3D$1;
    }());
    HomeController3D.HomeController3D$1 = HomeController3D$1;
    var HomeController3D$2 = (function () {
        function HomeController3D$2(__parent, home, levelElevationChangeListener) {
            this.home = home;
            this.levelElevationChangeListener = levelElevationChangeListener;
            this.__parent = __parent;
        }
        HomeController3D$2.prototype.propertyChange = function (ev) {
            var oldSelectedLevel = ev.getOldValue();
            var selectedLevel = this.home.getSelectedLevel();
            if (this.home.getEnvironment().isObserverCameraElevationAdjusted()) {
                this.home.getObserverCamera().setZ(Math.max(this.__parent.getObserverCameraMinimumElevation(this.home), this.home.getObserverCamera().getZ() + (selectedLevel == null ? 0 : selectedLevel.getElevation()) - (oldSelectedLevel == null ? 0 : oldSelectedLevel.getElevation())));
            }
            if (oldSelectedLevel != null) {
                oldSelectedLevel.removePropertyChangeListener(this.levelElevationChangeListener);
            }
            if (selectedLevel != null) {
                selectedLevel.addPropertyChangeListener(this.levelElevationChangeListener);
            }
        };
        return HomeController3D$2;
    }());
    HomeController3D.HomeController3D$2 = HomeController3D$2;
    var HomeController3D$3 = (function () {
        function HomeController3D$3(__parent, home) {
            this.home = home;
            this.__parent = __parent;
        }
        HomeController3D$3.prototype.propertyChange = function (ev) {
            var levels = this.home.getLevels();
            var selectedLevel = this.home.getSelectedLevel();
            var visible = true;
            for (var i = 0; i < levels.length; i++) {
                /* get */ levels[i].setVisible(visible);
                if (levels[i] === selectedLevel && !this.home.getEnvironment().isAllLevelsVisible()) {
                    visible = false;
                }
            }
        };
        return HomeController3D$3;
    }());
    HomeController3D.HomeController3D$3 = HomeController3D$3;
})(HomeController3D || (HomeController3D = {}));
/**
 * Creates an unmodifiable catalog door or window of the default catalog.
 * @param {string} id    the id of the new door or window, or <code>null</code>
 * @param {string} name  the name of the new door or window
 * @param {string} description the description of the new door or window
 * @param {string} information additional information associated to the new door or window
 * @param {Array} tags tags associated to the new door or window
 * @param {number} creationDate creation date of the new door or window in milliseconds since the epoch
 * @param {number} grade grade of the new door or window or <code>null</code>
 * @param {Content} icon content of the icon of the new door or window
 * @param {Content} planIcon content of the icon of the new piece displayed in plan
 * @param {Content} model content of the 3D model of the new door or window
 * @param {number} width  the width in centimeters of the new door or window
 * @param {number} depth  the depth in centimeters of the new door or window
 * @param {number} height  the height in centimeters of the new door or window
 * @param {number} elevation  the elevation in centimeters of the new door or window
 * @param {number} dropOnTopElevation a percentage of the height at which should be placed
 * an object dropped on the new piece
 * @param {boolean} movable if <code>true</code>, the new door or window is movable
 * @param {string} cutOutShape the shape used to cut out walls that intersect the new door or window
 * @param {number} wallThickness a value in percentage of the depth of the new door or window
 * @param {number} wallDistance a distance in percentage of the depth of the new door or window
 * @param {Array} sashes the sashes attached to the new door or window
 * @param {Array} modelRotation the rotation 3 by 3 matrix applied to the door or window model
 * @param {boolean} backFaceShown <code>true</code> if back face should be shown instead of front faces
 * @param {string} creator the creator of the model
 * @param {boolean} resizable if <code>true</code>, the size of the new door or window may be edited
 * @param {boolean} deformable if <code>true</code>, the width, depth and height of the new piece may
 * change independently from each other
 * @param {boolean} texturable if <code>false</code> this piece should always keep the same color or texture.
 * @param {Big} price the price of the new door or window, or <code>null</code>
 * @param {Big} valueAddedTaxPercentage the Value Added Tax percentage applied to the
 * price of the new door or window or <code>null</code>
 * @param {string} currency the price currency, noted with ISO 4217 code, or <code>null</code>
 * @since 5.3
 * @class
 */
var CatalogDoorOrWindow = (function (_super) {
    __extends(CatalogDoorOrWindow, _super);
    function CatalogDoorOrWindow(id, name, description, information, tags, creationDate, grade, icon, planIcon, model, width, depth, height, elevation, dropOnTopElevation, movable, cutOutShape, wallThickness, wallDistance, sashes, modelRotation, backFaceShown, creator, resizable, deformable, texturable, price, valueAddedTaxPercentage, currency) {
        var _this = this;
        if (((typeof id === 'string') || id === null) && ((typeof name === 'string') || name === null) && ((typeof description === 'string') || description === null) && ((typeof information === 'string') || information === null) && ((tags != null && tags instanceof Array && (tags.length == 0 || tags[0] == null || (typeof tags[0] === 'string'))) || tags === null) && ((typeof creationDate === 'number') || creationDate === null) && ((typeof grade === 'number') || grade === null) && ((icon != null && (icon["__interfaces"] != null && icon["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || icon.constructor != null && icon.constructor["__interfaces"] != null && icon.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || icon === null) && ((planIcon != null && (planIcon["__interfaces"] != null && planIcon["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || planIcon.constructor != null && planIcon.constructor["__interfaces"] != null && planIcon.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || planIcon === null) && ((model != null && (model["__interfaces"] != null && model["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || model.constructor != null && model.constructor["__interfaces"] != null && model.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || model === null) && ((typeof width === 'number') || width === null) && ((typeof depth === 'number') || depth === null) && ((typeof height === 'number') || height === null) && ((typeof elevation === 'number') || elevation === null) && ((typeof dropOnTopElevation === 'number') || dropOnTopElevation === null) && ((typeof movable === 'boolean') || movable === null) && ((typeof cutOutShape === 'string') || cutOutShape === null) && ((typeof wallThickness === 'number') || wallThickness === null) && ((typeof wallDistance === 'number') || wallDistance === null) && ((sashes != null && sashes instanceof Array && (sashes.length == 0 || sashes[0] == null || (sashes[0] != null && sashes[0] instanceof Sash))) || sashes === null) && ((modelRotation != null && modelRotation instanceof Array && (modelRotation.length == 0 || modelRotation[0] == null || modelRotation[0] instanceof Array)) || modelRotation === null) && ((typeof backFaceShown === 'boolean') || backFaceShown === null) && ((typeof creator === 'string') || creator === null) && ((typeof resizable === 'boolean') || resizable === null) && ((typeof deformable === 'boolean') || deformable === null) && ((typeof texturable === 'boolean') || texturable === null) && ((price != null && price instanceof Big) || price === null) && ((valueAddedTaxPercentage != null && valueAddedTaxPercentage instanceof Big) || valueAddedTaxPercentage === null) && ((typeof currency === 'string') || currency === null)) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this, id, name, description, information, tags, creationDate, grade, icon, planIcon, model, width, depth, height, elevation, dropOnTopElevation, movable, null, modelRotation, backFaceShown, creator, resizable, deformable, texturable, price, valueAddedTaxPercentage, currency) || this;
            _this.wallThickness = 0;
            _this.wallDistance = 0;
            _this.sashes = null;
            _this.cutOutShape = null;
            _this.wallThickness = 0;
            _this.wallDistance = 0;
            _this.sashes = null;
            _this.cutOutShape = null;
            (function () {
                _this.cutOutShape = cutOutShape;
                _this.wallThickness = wallThickness;
                _this.wallDistance = wallDistance;
                _this.sashes = sashes;
            })();
        }
        else if (((typeof id === 'string') || id === null) && ((name != null && (name["__interfaces"] != null && name["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || name.constructor != null && name.constructor["__interfaces"] != null && name.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || name === null) && ((description != null && (description["__interfaces"] != null && description["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0 || description.constructor != null && description.constructor["__interfaces"] != null && description.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Content") >= 0)) || description === null) && ((typeof information === 'number') || information === null) && ((typeof tags === 'number') || tags === null) && ((typeof creationDate === 'number') || creationDate === null) && ((typeof grade === 'number') || grade === null) && ((typeof icon === 'boolean') || icon === null) && ((typeof planIcon === 'number') || planIcon === null) && ((typeof model === 'number') || model === null) && ((width != null && width instanceof Array && (width.length == 0 || width[0] == null || (width[0] != null && width[0] instanceof Sash))) || width === null) && ((typeof depth === 'number') || depth === null) && ((height != null && height instanceof Array && (height.length == 0 || height[0] == null || height[0] instanceof Array)) || height === null) && ((typeof elevation === 'boolean') || elevation === null) && ((typeof dropOnTopElevation === 'number') || dropOnTopElevation === null) && ((typeof movable === 'boolean') || movable === null) && cutOutShape === undefined && wallThickness === undefined && wallDistance === undefined && sashes === undefined && modelRotation === undefined && backFaceShown === undefined && creator === undefined && resizable === undefined && deformable === undefined && texturable === undefined && price === undefined && valueAddedTaxPercentage === undefined && currency === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var name_4 = __args[0];
            var icon_2 = __args[1];
            var model_2 = __args[2];
            var width_4 = __args[3];
            var depth_2 = __args[4];
            var height_5 = __args[5];
            var elevation_2 = __args[6];
            var movable_2 = __args[7];
            var wallThickness_1 = __args[8];
            var wallDistance_1 = __args[9];
            var sashes_1 = __args[10];
            var color = __args[11];
            var modelRotation_3 = __args[12];
            var backFaceShown_3 = __args[13];
            var iconYaw = __args[14];
            var proportional = __args[15];
            null;
            _this.wallThickness = 0;
            _this.wallDistance = 0;
            _this.sashes = null;
            _this.cutOutShape = null;
            _this.wallThickness = 0;
            _this.wallDistance = 0;
            _this.sashes = null;
            _this.cutOutShape = null;
            (function () {
                _this.wallThickness = wallThickness_1;
                _this.wallDistance = wallDistance_1;
                _this.sashes = sashes_1;
                _this.cutOutShape = null;
            })();
        }
        else
            throw new Error('invalid overload');
        return _this;
    }
    /**
     * Returns the default thickness of the wall in which this door or window should be placed.
     * @return {number} a value in percentage of the depth of the door or the window.
     */
    CatalogDoorOrWindow.prototype.getWallThickness = function () {
        return this.wallThickness;
    };
    /**
     * Returns the default distance that should lie at the back side of this door or window.
     * @return {number} a distance in percentage of the depth of the door or the window.
     */
    CatalogDoorOrWindow.prototype.getWallDistance = function () {
        return this.wallDistance;
    };
    /**
     * Returns a copy of the sashes attached to this door or window.
     * If no sash is defined an empty array is returned.
     * @return {Array}
     */
    CatalogDoorOrWindow.prototype.getSashes = function () {
        if (this.sashes.length === 0) {
            return this.sashes;
        }
        else {
            return this.sashes.slice(0);
        }
    };
    /**
     * Returns the shape used to cut out walls that intersect this new door or window.
     * @return {string}
     */
    CatalogDoorOrWindow.prototype.getCutOutShape = function () {
        return this.cutOutShape;
    };
    /**
     * Returns always <code>true</code>.
     * @return {boolean}
     */
    CatalogDoorOrWindow.prototype.isDoorOrWindow = function () {
        return true;
    };
    return CatalogDoorOrWindow;
}(CatalogPieceOfFurniture));
CatalogDoorOrWindow["__class"] = "CatalogDoorOrWindow";
CatalogDoorOrWindow["__interfaces"] = ["com.eteks.sweethome3d.model.CatalogItem", "com.eteks.sweethome3d.model.DoorOrWindow", "com.eteks.sweethome3d.model.PieceOfFurniture", "java.lang.Comparable"];
/**
 * Creates an unmodifiable catalog light of the default catalog.
 * @param {string} id    the id of the new light, or <code>null</code>
 * @param {string} name  the name of the new light
 * @param {string} description the description of the new light
 * @param {string} information additional information associated to the new light
 * @param {Array} tags tags associated to the new light
 * @param {number} creationDate creation date of the new light in milliseconds since the epoch
 * @param {number} grade grade of the new light or <code>null</code>
 * @param {Content} icon content of the icon of the new light
 * @param {Content} planIcon content of the icon of the new piece displayed in plan
 * @param {Content} model content of the 3D model of the new light
 * @param {number} width  the width in centimeters of the new light
 * @param {number} depth  the depth in centimeters of the new light
 * @param {number} height  the height in centimeters of the new light
 * @param {number} dropOnTopElevation a percentage of the height at which should be placed
 * an object dropped on the new piece
 * @param {number} elevation  the elevation in centimeters of the new light
 * @param {boolean} movable if <code>true</code>, the new light is movable
 * @param {Array} lightSources the light sources of the new light
 * @param {string} staircaseCutOutShape the shape used to cut out upper levels when they intersect
 * with the piece like a staircase
 * @param {Array} modelRotation the rotation 3 by 3 matrix applied to the light model
 * @param {boolean} backFaceShown <code>true</code> if back face should be shown instead of front faces
 * @param {string} creator the creator of the model
 * @param {boolean} resizable if <code>true</code>, the size of the new light may be edited
 * @param {boolean} deformable if <code>true</code>, the width, depth and height of the new piece may
 * change independently from each other
 * @param {boolean} texturable if <code>false</code> this piece should always keep the same color or texture.
 * @param {Big} price the price of the new light, or <code>null</code>
 * @param {Big} valueAddedTaxPercentage the Value Added Tax percentage applied to the
 * price of the new light or <code>null</code>
 * @param {string} currency the price currency, noted with ISO 4217 code, or <code>null</code>
 * @since 5.3
 * @class
 */
var CatalogLight = (function (_super) {
    __extends(CatalogLight, _super);
    function CatalogLight(id, name, description, information, tags, creationDate, grade, icon, planIcon, model, width, depth, height, elevation, dropOnTopElevation, movable, lightSources, staircaseCutOutShape, modelRotation, backFaceShown, creator, resizable, deformable, texturable, price, valueAddedTaxPercentage, currency) {
        var _this = _super.call(this, id, name, description, information, tags, creationDate, grade, icon, planIcon, model, width, depth, height, elevation, dropOnTopElevation, movable, staircaseCutOutShape, modelRotation, backFaceShown, creator, resizable, deformable, texturable, price, valueAddedTaxPercentage, currency) || this;
        _this.lightSources = null;
        _this.lightSources = lightSources;
        return _this;
    }
    /**
     * Returns the sources managed by this light. Each light source point
     * is a percentage of the width, the depth and the height of this light,
     * with the abscissa origin at the left side of the piece,
     * the ordinate origin at the front side of the piece
     * and the elevation origin at the bottom side of the piece.
     * @return {Array} a copy of light sources array.
     */
    CatalogLight.prototype.getLightSources = function () {
        if (this.lightSources.length === 0) {
            return this.lightSources;
        }
        else {
            return this.lightSources.slice(0);
        }
    };
    return CatalogLight;
}(CatalogPieceOfFurniture));
CatalogLight["__class"] = "CatalogLight";
CatalogLight["__interfaces"] = ["com.eteks.sweethome3d.model.CatalogItem", "com.eteks.sweethome3d.model.PieceOfFurniture", "java.lang.Comparable", "com.eteks.sweethome3d.model.Light"];
/**
 * Creates a camera at given location and angles.
 * @since 3.0
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} yaw
 * @param {number} pitch
 * @param {number} fieldOfView
 * @param {number} time
 * @param {Camera.Lens} lens
 * @class
 */
var Camera = (function (_super) {
    __extends(Camera, _super);
    function Camera(x, y, z, yaw, pitch, fieldOfView, time, lens) {
        var _this = this;
        if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof z === 'number') || z === null) && ((typeof yaw === 'number') || yaw === null) && ((typeof pitch === 'number') || pitch === null) && ((typeof fieldOfView === 'number') || fieldOfView === null) && ((typeof time === 'number') || time === null) && ((typeof lens === 'number') || lens === null)) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this) || this;
            _this.name = null;
            _this.x = 0;
            _this.y = 0;
            _this.z = 0;
            _this.yaw = 0;
            _this.pitch = 0;
            _this.fieldOfView = 0;
            _this.time = 0;
            _this.lens = null;
            _this.lensName = null;
            _this.propertyChangeSupport = new PropertyChangeSupport(_this);
            _this.name = null;
            _this.x = 0;
            _this.y = 0;
            _this.z = 0;
            _this.yaw = 0;
            _this.pitch = 0;
            _this.fieldOfView = 0;
            _this.time = 0;
            _this.lens = null;
            _this.lensName = null;
            (function () {
                _this.x = x;
                _this.y = y;
                _this.z = z;
                _this.yaw = yaw;
                _this.pitch = pitch;
                _this.fieldOfView = fieldOfView;
                _this.time = time;
                _this.lens = lens;
            })();
        }
        else if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof z === 'number') || z === null) && ((typeof yaw === 'number') || yaw === null) && ((typeof pitch === 'number') || pitch === null) && ((typeof fieldOfView === 'number') || fieldOfView === null) && time === undefined && lens === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_25 = Array.prototype.slice.call(arguments);
                var time_1 = Camera.midday();
                var lens_1 = Camera.Lens.PINHOLE;
                _this = _super.call(this) || this;
                _this.name = null;
                _this.x = 0;
                _this.y = 0;
                _this.z = 0;
                _this.yaw = 0;
                _this.pitch = 0;
                _this.fieldOfView = 0;
                _this.time = 0;
                _this.lens = null;
                _this.lensName = null;
                _this.propertyChangeSupport = new PropertyChangeSupport(_this);
                _this.name = null;
                _this.x = 0;
                _this.y = 0;
                _this.z = 0;
                _this.yaw = 0;
                _this.pitch = 0;
                _this.fieldOfView = 0;
                _this.time = 0;
                _this.lens = null;
                _this.lensName = null;
                (function () {
                    _this.x = x;
                    _this.y = y;
                    _this.z = z;
                    _this.yaw = yaw;
                    _this.pitch = pitch;
                    _this.fieldOfView = fieldOfView;
                    _this.time = time_1;
                    _this.lens = lens_1;
                })();
            }
        }
        else
            throw new Error('invalid overload');
        return _this;
    }
    /**
     * Returns the time of midday today in milliseconds since the Epoch in UTC time zone.
     * @return {number}
     * @private
     */
    Camera.midday = function () {
        var midday = new Date();
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCHours(p) : d.setHours(p); })(midday, 12);
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCMinutes(p) : d.setMinutes(p); })(midday, 0);
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCSeconds(p) : d.setSeconds(p); })(midday, 0);
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCMilliseconds(p) : d.setMilliseconds(p); })(midday, 0);
        return midday.getTime();
    };
    /**
     * Adds the property change <code>listener</code> in parameter to this camera.
     * @param {PropertyChangeListener} listener
     */
    Camera.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this camera.
     * @param {PropertyChangeListener} listener
     */
    Camera.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
    };
    /**
     * Returns the name of this camera.
     * @since 3.0
     * @return {string}
     */
    Camera.prototype.getName = function () {
        return this.name;
    };
    /**
     * Sets the name of this camera and notifies listeners of this change.
     * @since 3.0
     * @param {string} name
     */
    Camera.prototype.setName = function (name) {
        if (name !== this.name && (name == null || !(name === this.name))) {
            var oldName = this.name;
            this.name = name;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME", oldName, name);
        }
    };
    /**
     * Returns the yaw angle in radians of this camera.
     * @return {number}
     */
    Camera.prototype.getYaw = function () {
        return this.yaw;
    };
    /**
     * Sets the yaw angle in radians of this camera and notifies listeners of this change.
     * @param {number} yaw
     */
    Camera.prototype.setYaw = function (yaw) {
        if (yaw !== this.yaw) {
            var oldYaw = this.yaw;
            this.yaw = yaw;
            this.propertyChangeSupport.firePropertyChange(/* name */ "YAW", oldYaw, yaw);
        }
    };
    /**
     * Returns the pitch angle in radians of this camera.
     * @return {number}
     */
    Camera.prototype.getPitch = function () {
        return this.pitch;
    };
    /**
     * Sets the pitch angle in radians of this camera and notifies listeners of this change.
     * @param {number} pitch
     */
    Camera.prototype.setPitch = function (pitch) {
        if (pitch !== this.pitch) {
            var oldPitch = this.pitch;
            this.pitch = pitch;
            this.propertyChangeSupport.firePropertyChange(/* name */ "PITCH", oldPitch, pitch);
        }
    };
    /**
     * Returns the field of view in radians of this camera.
     * @return {number}
     */
    Camera.prototype.getFieldOfView = function () {
        return this.fieldOfView;
    };
    /**
     * Sets the field of view in radians of this camera and notifies listeners of this change.
     * @param {number} fieldOfView
     */
    Camera.prototype.setFieldOfView = function (fieldOfView) {
        if (fieldOfView !== this.fieldOfView) {
            var oldFieldOfView = this.fieldOfView;
            this.fieldOfView = fieldOfView;
            this.propertyChangeSupport.firePropertyChange(/* name */ "FIELD_OF_VIEW", oldFieldOfView, fieldOfView);
        }
    };
    /**
     * Returns the abscissa of this camera.
     * @return {number}
     */
    Camera.prototype.getX = function () {
        return this.x;
    };
    /**
     * Sets the abscissa of this camera and notifies listeners of this change.
     * @param {number} x
     */
    Camera.prototype.setX = function (x) {
        if (x !== this.x) {
            var oldX = this.x;
            this.x = x;
            this.propertyChangeSupport.firePropertyChange(/* name */ "X", oldX, x);
        }
    };
    /**
     * Returns the ordinate of this camera.
     * @return {number}
     */
    Camera.prototype.getY = function () {
        return this.y;
    };
    /**
     * Sets the ordinate of this camera and notifies listeners of this change.
     * @param {number} y
     */
    Camera.prototype.setY = function (y) {
        if (y !== this.y) {
            var oldY = this.y;
            this.y = y;
            this.propertyChangeSupport.firePropertyChange(/* name */ "Y", oldY, y);
        }
    };
    /**
     * Returns the elevation of this camera.
     * @return {number}
     */
    Camera.prototype.getZ = function () {
        return this.z;
    };
    /**
     * Sets the elevation of this camera and notifies listeners of this change.
     * @param {number} z
     */
    Camera.prototype.setZ = function (z) {
        if (z !== this.z) {
            var oldZ = this.z;
            this.z = z;
            this.propertyChangeSupport.firePropertyChange(/* name */ "Z", oldZ, z);
        }
    };
    /**
     * Returns the time in milliseconds when this camera is used.
     * @return {number} a time in milliseconds since the Epoch in UTC time zone
     * @since 3.0
     */
    Camera.prototype.getTime = function () {
        return this.time;
    };
    /**
     * Sets the use time in milliseconds since the Epoch in UTC time zone,
     * and notifies listeners of this change.
     * @since 3.0
     * @param {number} time
     */
    Camera.prototype.setTime = function (time) {
        if (this.time !== time) {
            var oldTime = this.time;
            this.time = time;
            this.propertyChangeSupport.firePropertyChange(/* name */ "TIME", oldTime, time);
        }
    };
    /**
     * Returns a time expressed in UTC time zone converted to the given time zone.
     * @since 3.0
     * @param {number} utcTime
     * @param {string} timeZone
     * @return {number}
     */
    Camera.convertTimeToTimeZone = function (utcTime, timeZone) {
        var utcCalendar = new Date();
        /* setTimeInMillis */ utcCalendar.setTime(utcTime);
        var convertedCalendar = new Date();
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCFullYear(p) : d.setFullYear(p); })(convertedCalendar, /* get */ (function (d) { return d["UTC"] ? d.getUTCFullYear() : d.getFullYear(); })(utcCalendar));
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCMonth(p) : d.setMonth(p); })(convertedCalendar, /* get */ (function (d) { return d["UTC"] ? d.getUTCMonth() : d.getMonth(); })(utcCalendar));
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCDate(p) : d.setDate(p); })(convertedCalendar, /* get */ (function (d) { return d["UTC"] ? d.getUTCDate() : d.getDate(); })(utcCalendar));
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCHours(p) : d.setHours(p); })(convertedCalendar, /* get */ (function (d) { return d["UTC"] ? d.getUTCHours() : d.getHours(); })(utcCalendar));
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCMinutes(p) : d.setMinutes(p); })(convertedCalendar, /* get */ (function (d) { return d["UTC"] ? d.getUTCMinutes() : d.getMinutes(); })(utcCalendar));
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCSeconds(p) : d.setSeconds(p); })(convertedCalendar, /* get */ (function (d) { return d["UTC"] ? d.getUTCSeconds() : d.getSeconds(); })(utcCalendar));
        /* set */ (function (d, p) { return d["UTC"] ? d.setUTCMilliseconds(p) : d.setMilliseconds(p); })(convertedCalendar, /* get */ (function (d) { return d["UTC"] ? d.getUTCMilliseconds() : d.getMilliseconds(); })(utcCalendar));
        return convertedCalendar.getTime();
    };
    /**
     * Returns the lens of this camera.
     * @since 3.0
     * @return {Camera.Lens}
     */
    Camera.prototype.getLens = function () {
        return this.lens;
    };
    /**
     * Sets the lens of this camera and notifies listeners of this change.
     * @since 3.0
     * @param {Camera.Lens} lens
     */
    Camera.prototype.setLens = function (lens) {
        if (lens !== this.lens) {
            var oldLens = this.lens;
            this.lens = lens;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LENS", oldLens, lens);
        }
    };
    /**
     * Sets the location and angles of this camera from the <code>camera</code> in parameter.
     * @since 2.3
     * @param {Camera} camera
     */
    Camera.prototype.setCamera = function (camera) {
        this.setX(camera.getX());
        this.setY(camera.getY());
        this.setZ(camera.getZ());
        this.setYaw(camera.getYaw());
        this.setPitch(camera.getPitch());
        this.setFieldOfView(camera.getFieldOfView());
    };
    /**
     * Returns a clone of this camera.
     * @since 2.3
     * @return {Camera}
     */
    Camera.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_2 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_2[p] = o[p];
            }
            return clone_2;
        } })(this);
        clone.propertyChangeSupport = new PropertyChangeSupport(clone);
        return clone;
    };
    return Camera;
}(HomeObject));
Camera["__class"] = "Camera";
Camera["__interfaces"] = ["java.lang.Cloneable", "java.io.Serializable"];
(function (Camera) {
    /**
     * The kind of lens that can be used with a camera.
     * @author Emmanuel Puybaret
     * @since 3.0
     * @enum
     */
    var Lens;
    (function (Lens) {
        Lens[Lens["PINHOLE"] = 0] = "PINHOLE";
        Lens[Lens["NORMAL"] = 1] = "NORMAL";
        Lens[Lens["FISHEYE"] = 2] = "FISHEYE";
        Lens[Lens["SPHERICAL"] = 3] = "SPHERICAL";
    })(Lens = Camera.Lens || (Camera.Lens = {}));
})(Camera || (Camera = {}));
/**
 * Creates a compass drawn at the given point.
 * North direction is set to zero, time zone to default
 * and the latitudeInDegrees and the longitudeInDegrees of this new compass is equal
 * to the geographic point matching the default time zone.
 * @param {number} x
 * @param {number} y
 * @param {number} diameter
 * @class
 */
var Compass = (function (_super) {
    __extends(Compass, _super);
    function Compass(x, y, diameter) {
        var _this = _super.call(this) || this;
        /*private*/ _this.propertyChangeSupport = new PropertyChangeSupport(_this);
        _this.x = 0;
        _this.y = 0;
        _this.diameter = 0;
        _this.visible = false;
        _this.northDirection = 0;
        _this.latitude = 0;
        _this.longitude = 0;
        _this.timeZone = null;
        _this.pointsCache = null;
        _this.dateCache = null;
        _this.sunElevationCache = 0;
        _this.sunAzimuthCache = 0;
        _this.x = x;
        _this.y = y;
        _this.diameter = diameter;
        _this.visible = true;
        _this.timeZone = "UTC";
        _this.initGeographicPoint();
        return _this;
    }
    /**
     * Adds the property change <code>listener</code> in parameter to this compass.
     * @param {PropertyChangeListener} listener
     */
    Compass.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this compass.
     * @param {PropertyChangeListener} listener
     */
    Compass.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
    };
    /**
     * Returns the abscissa of the center of this compass.
     * @return {number}
     */
    Compass.prototype.getX = function () {
        return this.x;
    };
    /**
     * Sets the abscissa of the center of this compass. Once this compass is updated,
     * listeners added to this compass will receive a change notification.
     * @param {number} x
     */
    Compass.prototype.setX = function (x) {
        if (x !== this.x) {
            var oldX = this.x;
            this.x = x;
            this.pointsCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "X", oldX, x);
        }
    };
    /**
     * Returns the ordinate of the center of this compass.
     * @return {number}
     */
    Compass.prototype.getY = function () {
        return this.y;
    };
    /**
     * Sets the ordinate of the center of this compass. Once this compass is updated,
     * listeners added to this compass will receive a change notification.
     * @param {number} y
     */
    Compass.prototype.setY = function (y) {
        if (y !== this.y) {
            var oldY = this.y;
            this.y = y;
            this.pointsCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "Y", oldY, y);
        }
    };
    /**
     * Returns the diameter of this compass.
     * @return {number}
     */
    Compass.prototype.getDiameter = function () {
        return this.diameter;
    };
    /**
     * Sets the diameter of this compass. Once this compass is updated,
     * listeners added to this compass will receive a change notification.
     * @param {number} diameter
     */
    Compass.prototype.setDiameter = function (diameter) {
        if (diameter !== this.diameter) {
            var oldDiameter = this.diameter;
            this.diameter = diameter;
            this.pointsCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "DIAMETER", oldDiameter, diameter);
        }
    };
    /**
     * Returns <code>true</code> if this compass is visible.
     * @return {boolean}
     */
    Compass.prototype.isVisible = function () {
        return this.visible;
    };
    /**
     * Sets whether this compass is visible or not. Once this compass is updated,
     * listeners added to this piece will receive a change notification.
     * @param {boolean} visible
     */
    Compass.prototype.setVisible = function (visible) {
        if (visible !== this.visible) {
            this.visible = visible;
            this.propertyChangeSupport.firePropertyChange(/* name */ "VISIBLE", !visible, visible);
        }
    };
    /**
     * Returns the North direction angle of this compass in radians.
     * @return {number}
     */
    Compass.prototype.getNorthDirection = function () {
        return this.northDirection;
    };
    /**
     * Sets the North direction angle of this compass. Once this compass is updated,
     * listeners added to this compass will receive a change notification.
     * @param {number} northDirection
     */
    Compass.prototype.setNorthDirection = function (northDirection) {
        if (northDirection !== this.northDirection) {
            var oldNorthDirection = this.northDirection;
            this.northDirection = northDirection;
            this.pointsCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NORTH_DIRECTION", oldNorthDirection, northDirection);
        }
    };
    /**
     * Returns the latitudeInDegrees of this compass in radians.
     * @return {number}
     */
    Compass.prototype.getLatitude = function () {
        return this.latitude;
    };
    /**
     * Sets the latitudeInDegrees of this compass. Once this compass is updated,
     * listeners added to this compass will receive a change notification.
     * @param {number} latitude
     */
    Compass.prototype.setLatitude = function (latitude) {
        if (latitude !== this.latitude) {
            var oldLatitude = this.latitude;
            this.latitude = latitude;
            this.dateCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LATITUDE", oldLatitude, latitude);
        }
    };
    /**
     * Returns the longitudeInDegrees of this compass in radians.
     * @return {number}
     */
    Compass.prototype.getLongitude = function () {
        return this.longitude;
    };
    /**
     * Sets the longitudeInDegrees of the center of this compass. Once this compass is updated,
     * listeners added to this compass will receive a change notification.
     * @param {number} longitude
     */
    Compass.prototype.setLongitude = function (longitude) {
        if (longitude !== this.longitude) {
            var oldLongitude = this.longitude;
            this.longitude = longitude;
            this.dateCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LONGITUDE", oldLongitude, longitude);
        }
    };
    /**
     * Returns the time zone identifier of this compass.
     * @see java.util.TimeZone
     * @return {string}
     */
    Compass.prototype.getTimeZone = function () {
        return this.timeZone;
    };
    /**
     * Sets the time zone identifier of this compass. Once this compass is updated,
     * listeners added to this compass will receive a change notification.
     * @throws IllegalArgumentException if <code>timeZone</code> is <code>null</code> or contains an unknown identifier.
     * @see java.util.TimeZone
     * @param {string} timeZone
     */
    Compass.prototype.setTimeZone = function (timeZone) {
        if (!(this.timeZone === timeZone)) {
            if (timeZone == null) {
                throw new IllegalArgumentException("Time zone ID can\'t be null");
            }
            var oldTimeZone = this.timeZone;
            this.timeZone = timeZone;
            this.dateCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "TIME_ZONE", oldTimeZone, timeZone);
        }
    };
    /**
     * Returns the corner points of the square that contains compass disc.
     * @return {Array}
     */
    Compass.prototype.getPoints = function () {
        if (this.pointsCache == null) {
            var pieceRectangle = new java.awt.geom.Rectangle2D.Float(this.getX() - this.getDiameter() / 2, this.getY() - this.getDiameter() / 2, this.getDiameter(), this.getDiameter());
            var rotation = java.awt.geom.AffineTransform.getRotateInstance(this.getNorthDirection(), this.getX(), this.getY());
            this.pointsCache = (function (dims) { var allocate = function (dims) { if (dims.length == 0) {
                return 0;
            }
            else {
                var array = [];
                for (var i = 0; i < dims[0]; i++) {
                    array.push(allocate(dims.slice(1)));
                }
                return array;
            } }; return allocate(dims); })([4, 2]);
            var it = pieceRectangle.getPathIterator(rotation);
            for (var i = 0; i < this.pointsCache.length; i++) {
                it.currentSegment(this.pointsCache[i]);
                it.next();
            }
        }
        return [/* clone */ this.pointsCache[0].slice(0), /* clone */ this.pointsCache[1].slice(0), /* clone */ this.pointsCache[2].slice(0), /* clone */ this.pointsCache[3].slice(0)];
    };
    /**
     * Returns <code>true</code> if the disc of this compass intersects
     * with the horizontal rectangle which opposite corners are at points
     * (<code>x0</code>, <code>y0</code>) and (<code>x1</code>, <code>y1</code>).
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {boolean}
     */
    Compass.prototype.intersectsRectangle = function (x0, y0, x1, y1) {
        var rectangle = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
        rectangle.add(x1, y1);
        return new java.awt.geom.Ellipse2D.Float(this.getX() - this.getDiameter() / 2, this.getY() - this.getDiameter() / 2, this.getDiameter(), this.getDiameter()).intersects(rectangle);
    };
    /**
     * Returns <code>true</code> if the disc of this compass contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    Compass.prototype.containsPoint = function (x, y, margin) {
        var shape = new java.awt.geom.Ellipse2D.Float(this.getX() - this.getDiameter() / 2, this.getY() - this.getDiameter() / 2, this.getDiameter(), this.getDiameter());
        if (margin === 0) {
            return shape.contains(x, y);
        }
        else {
            return shape.intersects(x - margin, y - margin, 2 * margin, 2 * margin);
        }
    };
    /**
     * Moves this compass of (<code>dx</code>, <code>dy</code>) units.
     * @param {number} dx
     * @param {number} dy
     */
    Compass.prototype.move = function (dx, dy) {
        this.setX(this.getX() + dx);
        this.setY(this.getY() + dy);
    };
    /**
     * Returns a clone of this compass.
     * @return {Compass}
     */
    Compass.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_3 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_3[p] = o[p];
            }
            return clone_3;
        } })(this);
        clone.propertyChangeSupport = new PropertyChangeSupport(clone);
        return clone;
    };
    Compass.prototype.computeJulianDay = function (year, month, day, hour, minute, second, timeZone, savingTime) {
        var dayPart = day + hour / 24.0 + minute / 1440.0 + second / 86400.0;
        if (month === 1 || month === 2) {
            year -= 1;
            month += 12;
        }
        var a = (year / 100 | 0);
        var b = 2 - a + (a / 4 | 0);
        var julianDay = ((365.25 * (year + 4716.0)) | 0) + (((30.6001 * (month + 1))) | 0) + dayPart + b - 1524.5;
        julianDay -= (timeZone + savingTime) / 24.0;
        julianDay -= 2451545.0;
        return julianDay;
    };
    Compass.prototype.toSiderealTime = function (julianDay) {
        var centuries = julianDay / 36525.0;
        var siderealTime = (24110.54841 + (8640184.812866 * centuries) + (0.093104 * Math.pow(centuries, 2.0)) - (6.2E-6 * Math.pow(centuries, 3.0))) / 3600.0;
        return ((siderealTime / 24.0) - ((siderealTime / 24.0) | 0)) * 24.0;
    };
    /**
     * Inits the latitudeInDegrees and longitudeInDegrees where this compass is located from the id of the default time zone.
     * @private
     */
    Compass.prototype.initGeographicPoint = function () {
        var timeZoneGeographicPoints;
        if (Compass.timeZoneGeographicPointsReference == null || Compass.timeZoneGeographicPointsReference == null) {
            timeZoneGeographicPoints = ({});
            var apia = new Compass.GeographicPoint(-13.833333, -171.73334);
            /* put */ (timeZoneGeographicPoints["Etc/GMT+11"] = apia);
            /* put */ (timeZoneGeographicPoints["Pacific/Apia"] = apia);
            /* put */ (timeZoneGeographicPoints["Pacific/Midway"] = new Compass.GeographicPoint(28.2, -177.35));
            /* put */ (timeZoneGeographicPoints["Pacific/Niue"] = new Compass.GeographicPoint(-19.055, -169.92));
            /* put */ (timeZoneGeographicPoints["Pacific/Pago_Pago"] = new Compass.GeographicPoint(-14.278055, -170.7025));
            /* put */ (timeZoneGeographicPoints["Pacific/Samoa"] = apia);
            /* put */ (timeZoneGeographicPoints["US/Samoa"] = apia);
            /* put */ (timeZoneGeographicPoints["America/Adak"] = new Compass.GeographicPoint(51.88, -176.65805));
            /* put */ (timeZoneGeographicPoints["America/Atka"] = new Compass.GeographicPoint(52.19611, -174.20056));
            var honolulu = new Compass.GeographicPoint(21.306944, -157.85834);
            /* put */ (timeZoneGeographicPoints["Etc/GMT+10"] = honolulu);
            /* put */ (timeZoneGeographicPoints["Pacific/Fakaofo"] = new Compass.GeographicPoint(-9.3653, -171.215));
            /* put */ (timeZoneGeographicPoints["Pacific/Honolulu"] = honolulu);
            /* put */ (timeZoneGeographicPoints["Pacific/Johnston"] = new Compass.GeographicPoint(16.75, -169.517));
            /* put */ (timeZoneGeographicPoints["Pacific/Rarotonga"] = new Compass.GeographicPoint(-21.233, -159.783));
            /* put */ (timeZoneGeographicPoints["Pacific/Tahiti"] = new Compass.GeographicPoint(-17.533333, -149.56667));
            /* put */ (timeZoneGeographicPoints["SystemV/HST10"] = honolulu);
            /* put */ (timeZoneGeographicPoints["US/Aleutian"] = new Compass.GeographicPoint(54.817, 164.033));
            /* put */ (timeZoneGeographicPoints["US/Hawaii"] = honolulu);
            /* put */ (timeZoneGeographicPoints["Pacific/Marquesas"] = new Compass.GeographicPoint(-9.45, -139.38));
            var anchorage = new Compass.GeographicPoint(61.218056, -149.90028);
            /* put */ (timeZoneGeographicPoints["America/Anchorage"] = anchorage);
            /* put */ (timeZoneGeographicPoints["America/Juneau"] = new Compass.GeographicPoint(58.301945, -134.41972));
            /* put */ (timeZoneGeographicPoints["America/Nome"] = new Compass.GeographicPoint(64.501114, -165.40639));
            /* put */ (timeZoneGeographicPoints["America/Yakutat"] = new Compass.GeographicPoint(59.546944, -139.72722));
            /* put */ (timeZoneGeographicPoints["Etc/GMT+9"] = anchorage);
            /* put */ (timeZoneGeographicPoints["Pacific/Gambier"] = new Compass.GeographicPoint(-23.1178, -134.97));
            /* put */ (timeZoneGeographicPoints["SystemV/YST9"] = anchorage);
            /* put */ (timeZoneGeographicPoints["SystemV/YST9YDT"] = anchorage);
            /* put */ (timeZoneGeographicPoints["US/Alaska"] = anchorage);
            /* put */ (timeZoneGeographicPoints["America/Dawson"] = new Compass.GeographicPoint(64.066666, -139.41667));
            /* put */ (timeZoneGeographicPoints["America/Ensenada"] = new Compass.GeographicPoint(31.866667, -116.61667));
            var losAngeles = new Compass.GeographicPoint(34.052223, -118.242775);
            /* put */ (timeZoneGeographicPoints["America/Los_Angeles"] = losAngeles);
            /* put */ (timeZoneGeographicPoints["America/Santa_Isabel"] = new Compass.GeographicPoint(28.383333, -113.35));
            /* put */ (timeZoneGeographicPoints["America/Tijuana"] = new Compass.GeographicPoint(32.533333, -117.01667));
            /* put */ (timeZoneGeographicPoints["America/Vancouver"] = new Compass.GeographicPoint(49.25, -123.13333));
            /* put */ (timeZoneGeographicPoints["America/Whitehorse"] = new Compass.GeographicPoint(60.716667, -135.05));
            /* put */ (timeZoneGeographicPoints["Canada/Pacific"] = new Compass.GeographicPoint(49.25, -123.13333));
            /* put */ (timeZoneGeographicPoints["Canada/Yukon"] = new Compass.GeographicPoint(60.716667, -135.05));
            /* put */ (timeZoneGeographicPoints["Etc/GMT+8"] = losAngeles);
            /* put */ (timeZoneGeographicPoints["Mexico/BajaNorte"] = new Compass.GeographicPoint(32.533333, -117.01667));
            /* put */ (timeZoneGeographicPoints["Pacific/Pitcairn"] = new Compass.GeographicPoint(-25.0667, -130.1));
            /* put */ (timeZoneGeographicPoints["SystemV/PST8"] = losAngeles);
            /* put */ (timeZoneGeographicPoints["SystemV/PST8PDT"] = losAngeles);
            /* put */ (timeZoneGeographicPoints["US/Pacific"] = losAngeles);
            /* put */ (timeZoneGeographicPoints["US/Pacific-New"] = losAngeles);
            /* put */ (timeZoneGeographicPoints["America/Boise"] = new Compass.GeographicPoint(43.61361, -116.2025));
            /* put */ (timeZoneGeographicPoints["America/Cambridge_Bay"] = new Compass.GeographicPoint(69.11667, -105.03333));
            /* put */ (timeZoneGeographicPoints["America/Chihuahua"] = new Compass.GeographicPoint(28.633333, -106.083336));
            /* put */ (timeZoneGeographicPoints["America/Dawson_Creek"] = new Compass.GeographicPoint(55.766666, -120.23333));
            var denver = new Compass.GeographicPoint(39.739166, -104.98417);
            /* put */ (timeZoneGeographicPoints["America/Denver"] = denver);
            /* put */ (timeZoneGeographicPoints["America/Edmonton"] = new Compass.GeographicPoint(53.55, -113.5));
            /* put */ (timeZoneGeographicPoints["America/Hermosillo"] = new Compass.GeographicPoint(29.066668, -110.96667));
            /* put */ (timeZoneGeographicPoints["America/Inuvik"] = new Compass.GeographicPoint(68.35, -133.7));
            /* put */ (timeZoneGeographicPoints["America/Mazatlan"] = new Compass.GeographicPoint(23.216667, -106.416664));
            /* put */ (timeZoneGeographicPoints["America/Ojinaga"] = new Compass.GeographicPoint(29.566668, -104.416664));
            /* put */ (timeZoneGeographicPoints["America/Phoenix"] = new Compass.GeographicPoint(33.448334, -112.07333));
            /* put */ (timeZoneGeographicPoints["America/Shiprock"] = new Compass.GeographicPoint(36.785557, -108.686386));
            /* put */ (timeZoneGeographicPoints["America/Yellowknife"] = new Compass.GeographicPoint(62.45, -114.35));
            /* put */ (timeZoneGeographicPoints["Canada/Mountain"] = new Compass.GeographicPoint(53.55, -113.5));
            /* put */ (timeZoneGeographicPoints["Etc/GMT+7"] = denver);
            /* put */ (timeZoneGeographicPoints["Mexico/BajaSur"] = new Compass.GeographicPoint(32.567, -116.633));
            /* put */ (timeZoneGeographicPoints["SystemV/MST7"] = denver);
            /* put */ (timeZoneGeographicPoints["SystemV/MST7MDT"] = denver);
            /* put */ (timeZoneGeographicPoints["US/Arizona"] = new Compass.GeographicPoint(33.448334, -112.07333));
            /* put */ (timeZoneGeographicPoints["US/Mountain"] = denver);
            /* put */ (timeZoneGeographicPoints["America/Belize"] = new Compass.GeographicPoint(17.483334, -88.183334));
            /* put */ (timeZoneGeographicPoints["America/Cancun"] = new Compass.GeographicPoint(21.166668, -86.833336));
            var chicago = new Compass.GeographicPoint(41.85, -87.65);
            /* put */ (timeZoneGeographicPoints["America/Chicago"] = chicago);
            /* put */ (timeZoneGeographicPoints["America/Costa_Rica"] = new Compass.GeographicPoint(9.933333, -84.083336));
            /* put */ (timeZoneGeographicPoints["America/El_Salvador"] = new Compass.GeographicPoint(13.7086115, -89.20306));
            /* put */ (timeZoneGeographicPoints["America/Guatemala"] = new Compass.GeographicPoint(14.621111, -90.52695));
            /* put */ (timeZoneGeographicPoints["America/Knox_IN"] = new Compass.GeographicPoint(41.295834, -86.625));
            /* put */ (timeZoneGeographicPoints["America/Managua"] = new Compass.GeographicPoint(12.150833, -86.26833));
            /* put */ (timeZoneGeographicPoints["America/Matamoros"] = new Compass.GeographicPoint(25.883333, -97.5));
            /* put */ (timeZoneGeographicPoints["America/Menominee"] = new Compass.GeographicPoint(45.107777, -87.61417));
            /* put */ (timeZoneGeographicPoints["America/Merida"] = new Compass.GeographicPoint(20.966667, -89.61667));
            /* put */ (timeZoneGeographicPoints["America/Mexico_City"] = new Compass.GeographicPoint(19.434168, -99.13861));
            /* put */ (timeZoneGeographicPoints["America/Monterrey"] = new Compass.GeographicPoint(25.666668, -100.316666));
            /* put */ (timeZoneGeographicPoints["America/Rainy_River"] = new Compass.GeographicPoint(48.716667, -94.566666));
            /* put */ (timeZoneGeographicPoints["America/Rankin_Inlet"] = new Compass.GeographicPoint(62.816666, -92.083336));
            /* put */ (timeZoneGeographicPoints["America/Regina"] = new Compass.GeographicPoint(50.45, -104.61667));
            /* put */ (timeZoneGeographicPoints["America/Swift_Current"] = new Compass.GeographicPoint(50.283333, -107.76667));
            /* put */ (timeZoneGeographicPoints["America/Tegucigalpa"] = new Compass.GeographicPoint(14.1, -87.21667));
            /* put */ (timeZoneGeographicPoints["America/Winnipeg"] = new Compass.GeographicPoint(49.88333, -97.166664));
            /* put */ (timeZoneGeographicPoints["Canada/Central"] = new Compass.GeographicPoint(50.45, -104.61667));
            /* put */ (timeZoneGeographicPoints["Canada/East-Saskatchewan"] = new Compass.GeographicPoint(51.216667, -102.46667));
            /* put */ (timeZoneGeographicPoints["Canada/Saskatchewan"] = new Compass.GeographicPoint(50.45, -104.61667));
            /* put */ (timeZoneGeographicPoints["Chile/EasterIsland"] = new Compass.GeographicPoint(-27.15, -109.425));
            /* put */ (timeZoneGeographicPoints["Etc/GMT+6"] = chicago);
            /* put */ (timeZoneGeographicPoints["Mexico/General"] = new Compass.GeographicPoint(19.434168, -99.13861));
            /* put */ (timeZoneGeographicPoints["Pacific/Easter"] = new Compass.GeographicPoint(-27.15, -109.425));
            /* put */ (timeZoneGeographicPoints["Pacific/Galapagos"] = new Compass.GeographicPoint(-0.667, -90.55));
            /* put */ (timeZoneGeographicPoints["SystemV/CST6"] = chicago);
            /* put */ (timeZoneGeographicPoints["SystemV/CST6CDT"] = chicago);
            /* put */ (timeZoneGeographicPoints["US/Central"] = chicago);
            /* put */ (timeZoneGeographicPoints["US/Indiana-Starke"] = new Compass.GeographicPoint(41.295834, -86.625));
            /* put */ (timeZoneGeographicPoints["America/Atikokan"] = new Compass.GeographicPoint(48.75, -91.61667));
            /* put */ (timeZoneGeographicPoints["America/Bogota"] = new Compass.GeographicPoint(4.6, -74.083336));
            /* put */ (timeZoneGeographicPoints["America/Cayman"] = new Compass.GeographicPoint(19.3, -81.38333));
            /* put */ (timeZoneGeographicPoints["America/Coral_Harbour"] = new Compass.GeographicPoint(64.13333, -83.166664));
            /* put */ (timeZoneGeographicPoints["America/Detroit"] = new Compass.GeographicPoint(42.33139, -83.04583));
            /* put */ (timeZoneGeographicPoints["America/Fort_Wayne"] = new Compass.GeographicPoint(41.130554, -85.12889));
            /* put */ (timeZoneGeographicPoints["America/Grand_Turk"] = new Compass.GeographicPoint(21.466667, -71.13333));
            /* put */ (timeZoneGeographicPoints["America/Guayaquil"] = new Compass.GeographicPoint(-2.1666667, -79.9));
            /* put */ (timeZoneGeographicPoints["America/Havana"] = new Compass.GeographicPoint(23.131945, -82.36417));
            /* put */ (timeZoneGeographicPoints["America/Indianapolis"] = new Compass.GeographicPoint(39.768333, -86.15806));
            /* put */ (timeZoneGeographicPoints["America/Iqaluit"] = new Compass.GeographicPoint(63.733334, -68.5));
            /* put */ (timeZoneGeographicPoints["America/Jamaica"] = new Compass.GeographicPoint(18.0, -76.8));
            /* put */ (timeZoneGeographicPoints["America/Lima"] = new Compass.GeographicPoint(-12.05, -77.05));
            /* put */ (timeZoneGeographicPoints["America/Louisville"] = new Compass.GeographicPoint(38.254166, -85.759445));
            /* put */ (timeZoneGeographicPoints["America/Montreal"] = new Compass.GeographicPoint(45.5, -73.583336));
            /* put */ (timeZoneGeographicPoints["America/Nassau"] = new Compass.GeographicPoint(25.083334, -77.35));
            var newYork = new Compass.GeographicPoint(40.71417, -74.006386);
            /* put */ (timeZoneGeographicPoints["America/New_York"] = newYork);
            /* put */ (timeZoneGeographicPoints["America/Nipigon"] = new Compass.GeographicPoint(49.016666, -88.25));
            /* put */ (timeZoneGeographicPoints["America/Panama"] = new Compass.GeographicPoint(8.966667, -79.53333));
            /* put */ (timeZoneGeographicPoints["America/Pangnirtung"] = new Compass.GeographicPoint(66.13333, -65.75));
            /* put */ (timeZoneGeographicPoints["America/Port-au-Prince"] = new Compass.GeographicPoint(18.539167, -72.335));
            /* put */ (timeZoneGeographicPoints["America/Resolute"] = new Compass.GeographicPoint(74.683334, -94.9));
            /* put */ (timeZoneGeographicPoints["America/Thunder_Bay"] = new Compass.GeographicPoint(48.4, -89.23333));
            /* put */ (timeZoneGeographicPoints["America/Toronto"] = new Compass.GeographicPoint(43.666668, -79.416664));
            /* put */ (timeZoneGeographicPoints["Canada/Eastern"] = new Compass.GeographicPoint(43.666668, -79.416664));
            /* put */ (timeZoneGeographicPoints["Etc/GMT+5"] = newYork);
            /* put */ (timeZoneGeographicPoints["SystemV/EST5"] = newYork);
            /* put */ (timeZoneGeographicPoints["SystemV/EST5EDT"] = newYork);
            /* put */ (timeZoneGeographicPoints["US/East-Indiana"] = new Compass.GeographicPoint(36.8381, -84.85));
            /* put */ (timeZoneGeographicPoints["US/Eastern"] = newYork);
            /* put */ (timeZoneGeographicPoints["US/Michigan"] = new Compass.GeographicPoint(42.33139, -83.04583));
            /* put */ (timeZoneGeographicPoints["America/Caracas"] = new Compass.GeographicPoint(10.5, -66.916664));
            /* put */ (timeZoneGeographicPoints["America/Anguilla"] = new Compass.GeographicPoint(18.216667, -63.05));
            /* put */ (timeZoneGeographicPoints["America/Antigua"] = new Compass.GeographicPoint(17.116667, -61.85));
            /* put */ (timeZoneGeographicPoints["America/Aruba"] = new Compass.GeographicPoint(10.541111, -72.9175));
            /* put */ (timeZoneGeographicPoints["America/Asuncion"] = new Compass.GeographicPoint(-25.266666, -57.666668));
            /* put */ (timeZoneGeographicPoints["America/Barbados"] = new Compass.GeographicPoint(13.1, -59.616665));
            /* put */ (timeZoneGeographicPoints["America/Blanc-Sablon"] = new Compass.GeographicPoint(51.433334, -57.11667));
            /* put */ (timeZoneGeographicPoints["America/Boa_Vista"] = new Compass.GeographicPoint(2.8166666, -60.666668));
            /* put */ (timeZoneGeographicPoints["America/Campo_Grande"] = new Compass.GeographicPoint(-20.45, -54.616665));
            /* put */ (timeZoneGeographicPoints["America/Cuiaba"] = new Compass.GeographicPoint(-15.583333, -56.083332));
            /* put */ (timeZoneGeographicPoints["America/Curacao"] = new Compass.GeographicPoint(12.1167, -68.933));
            /* put */ (timeZoneGeographicPoints["America/Dominica"] = new Compass.GeographicPoint(15.3, -61.4));
            /* put */ (timeZoneGeographicPoints["America/Eirunepe"] = new Compass.GeographicPoint(-6.6666665, -69.86667));
            /* put */ (timeZoneGeographicPoints["America/Glace_Bay"] = new Compass.GeographicPoint(46.2, -59.966667));
            /* put */ (timeZoneGeographicPoints["America/Goose_Bay"] = new Compass.GeographicPoint(53.333332, -60.416668));
            /* put */ (timeZoneGeographicPoints["America/Grenada"] = new Compass.GeographicPoint(12.05, -61.75));
            /* put */ (timeZoneGeographicPoints["America/Guadeloupe"] = new Compass.GeographicPoint(16.233334, -61.516666));
            /* put */ (timeZoneGeographicPoints["America/Guyana"] = new Compass.GeographicPoint(6.8, -58.166668));
            /* put */ (timeZoneGeographicPoints["America/Halifax"] = new Compass.GeographicPoint(44.65, -63.6));
            /* put */ (timeZoneGeographicPoints["America/La_Paz"] = new Compass.GeographicPoint(-16.5, -68.15));
            /* put */ (timeZoneGeographicPoints["America/Manaus"] = new Compass.GeographicPoint(-3.1133332, -60.025276));
            /* put */ (timeZoneGeographicPoints["America/Marigot"] = new Compass.GeographicPoint(18.073, 63.0844));
            /* put */ (timeZoneGeographicPoints["America/Martinique"] = new Compass.GeographicPoint(14.6, -61.083332));
            /* put */ (timeZoneGeographicPoints["America/Moncton"] = new Compass.GeographicPoint(46.083332, -64.76667));
            /* put */ (timeZoneGeographicPoints["America/Montserrat"] = new Compass.GeographicPoint(16.7, -62.216667));
            /* put */ (timeZoneGeographicPoints["America/Port_of_Spain"] = new Compass.GeographicPoint(10.65, -61.516666));
            /* put */ (timeZoneGeographicPoints["America/Porto_Acre"] = new Compass.GeographicPoint(-9.587778, -67.53555));
            /* put */ (timeZoneGeographicPoints["America/Porto_Velho"] = new Compass.GeographicPoint(-8.766666, -63.9));
            /* put */ (timeZoneGeographicPoints["America/Puerto_Rico"] = new Compass.GeographicPoint(18.467, 66.117));
            /* put */ (timeZoneGeographicPoints["America/Rio_Branco"] = new Compass.GeographicPoint(-9.966667, -67.8));
            var santiago = new Compass.GeographicPoint(-33.45, -70.666664);
            /* put */ (timeZoneGeographicPoints["America/Santiago"] = santiago);
            /* put */ (timeZoneGeographicPoints["America/Santo_Domingo"] = new Compass.GeographicPoint(18.466667, -69.9));
            /* put */ (timeZoneGeographicPoints["America/St_Barthelemy"] = new Compass.GeographicPoint(17.8978, -62.851));
            /* put */ (timeZoneGeographicPoints["America/St_Kitts"] = new Compass.GeographicPoint(17.3, -62.733));
            /* put */ (timeZoneGeographicPoints["America/St_Lucia"] = new Compass.GeographicPoint(14.0167, -60.9833));
            /* put */ (timeZoneGeographicPoints["America/St_Thomas"] = new Compass.GeographicPoint(18.3333, -64.9167));
            /* put */ (timeZoneGeographicPoints["America/St_Vincent"] = new Compass.GeographicPoint(13.1667, -61.2333));
            /* put */ (timeZoneGeographicPoints["America/Thule"] = new Compass.GeographicPoint(-54.27667, -36.511665));
            /* put */ (timeZoneGeographicPoints["America/Tortola"] = new Compass.GeographicPoint(18.416666, -64.61667));
            /* put */ (timeZoneGeographicPoints["America/Virgin"] = new Compass.GeographicPoint(18.34389, -64.931114));
            /* put */ (timeZoneGeographicPoints["Antarctica/Palmer"] = new Compass.GeographicPoint(-64.25, -62.833));
            /* put */ (timeZoneGeographicPoints["Atlantic/Bermuda"] = new Compass.GeographicPoint(32.294167, -64.78389));
            /* put */ (timeZoneGeographicPoints["Atlantic/Stanley"] = new Compass.GeographicPoint(-51.7, -57.85));
            /* put */ (timeZoneGeographicPoints["Brazil/Acre"] = new Compass.GeographicPoint(-10.883333, -45.083332));
            /* put */ (timeZoneGeographicPoints["Brazil/West"] = new Compass.GeographicPoint(-10.883333, -45.083332));
            /* put */ (timeZoneGeographicPoints["Canada/Atlantic"] = new Compass.GeographicPoint(44.65, -63.6));
            /* put */ (timeZoneGeographicPoints["Chile/Continental"] = santiago);
            /* put */ (timeZoneGeographicPoints["Etc/GMT+4"] = santiago);
            /* put */ (timeZoneGeographicPoints["SystemV/AST4"] = new Compass.GeographicPoint(44.65, -63.6));
            /* put */ (timeZoneGeographicPoints["SystemV/AST4ADT"] = new Compass.GeographicPoint(44.65, -63.6));
            /* put */ (timeZoneGeographicPoints["America/St_Johns"] = new Compass.GeographicPoint(47.5675, -52.7072));
            /* put */ (timeZoneGeographicPoints["Canada/Newfoundland"] = new Compass.GeographicPoint(47.5675, -52.7072));
            /* put */ (timeZoneGeographicPoints["America/Araguaina"] = new Compass.GeographicPoint(-7.16, -48.0575));
            /* put */ (timeZoneGeographicPoints["America/Bahia"] = new Compass.GeographicPoint(-12.983334, -38.516666));
            /* put */ (timeZoneGeographicPoints["America/Belem"] = new Compass.GeographicPoint(-1.45, -48.483334));
            /* put */ (timeZoneGeographicPoints["America/Buenos_Aires"] = new Compass.GeographicPoint(-34.5875, -58.6725));
            /* put */ (timeZoneGeographicPoints["America/Catamarca"] = new Compass.GeographicPoint(-28.466667, -65.78333));
            /* put */ (timeZoneGeographicPoints["America/Cayenne"] = new Compass.GeographicPoint(4.9333334, -52.333332));
            /* put */ (timeZoneGeographicPoints["America/Cordoba"] = new Compass.GeographicPoint(-31.4, -64.183334));
            /* put */ (timeZoneGeographicPoints["America/Fortaleza"] = new Compass.GeographicPoint(-3.7166667, -38.5));
            /* put */ (timeZoneGeographicPoints["America/Godthab"] = new Compass.GeographicPoint(64.183334, -51.75));
            /* put */ (timeZoneGeographicPoints["America/Jujuy"] = new Compass.GeographicPoint(-24.183332, -65.3));
            /* put */ (timeZoneGeographicPoints["America/Maceio"] = new Compass.GeographicPoint(-9.666667, -35.716667));
            /* put */ (timeZoneGeographicPoints["America/Mendoza"] = new Compass.GeographicPoint(-32.883335, -68.816666));
            /* put */ (timeZoneGeographicPoints["America/Miquelon"] = new Compass.GeographicPoint(47.0975, -56.38139));
            /* put */ (timeZoneGeographicPoints["America/Montevideo"] = new Compass.GeographicPoint(-34.858055, -56.170834));
            /* put */ (timeZoneGeographicPoints["America/Paramaribo"] = new Compass.GeographicPoint(5.8333335, -55.166668));
            /* put */ (timeZoneGeographicPoints["America/Recife"] = new Compass.GeographicPoint(-8.05, -34.9));
            /* put */ (timeZoneGeographicPoints["America/Rosario"] = new Compass.GeographicPoint(-32.95111, -60.66639));
            /* put */ (timeZoneGeographicPoints["America/Santarem"] = new Compass.GeographicPoint(-2.4333334, -54.7));
            var saoPaulo = new Compass.GeographicPoint(-23.533333, -46.616665);
            /* put */ (timeZoneGeographicPoints["America/Sao_Paulo"] = saoPaulo);
            /* put */ (timeZoneGeographicPoints["Antarctica/Rothera"] = new Compass.GeographicPoint(67.567, 68.133));
            /* put */ (timeZoneGeographicPoints["Brazil/East"] = saoPaulo);
            /* put */ (timeZoneGeographicPoints["Etc/GMT+3"] = saoPaulo);
            /* put */ (timeZoneGeographicPoints["America/Noronha"] = new Compass.GeographicPoint(3.85, 25.417));
            var southGeorgia = new Compass.GeographicPoint(54.25, 36.75);
            /* put */ (timeZoneGeographicPoints["Atlantic/South_Georgia"] = southGeorgia);
            /* put */ (timeZoneGeographicPoints["Brazil/DeNoronha"] = new Compass.GeographicPoint(3.85, 25.417));
            /* put */ (timeZoneGeographicPoints["Etc/GMT+2"] = southGeorgia);
            /* put */ (timeZoneGeographicPoints["America/Scoresbysund"] = new Compass.GeographicPoint(70.48333, -21.966667));
            var azores = new Compass.GeographicPoint(37.483334, -2.5666666);
            /* put */ (timeZoneGeographicPoints["Atlantic/Azores"] = azores);
            /* put */ (timeZoneGeographicPoints["Atlantic/Cape_Verde"] = new Compass.GeographicPoint(14.916667, -23.516666));
            /* put */ (timeZoneGeographicPoints["Etc/GMT+1"] = azores);
            /* put */ (timeZoneGeographicPoints["Africa/Abidjan"] = new Compass.GeographicPoint(5.341111, -4.028056));
            /* put */ (timeZoneGeographicPoints["Africa/Accra"] = new Compass.GeographicPoint(5.55, -0.2166667));
            /* put */ (timeZoneGeographicPoints["Africa/Bamako"] = new Compass.GeographicPoint(12.65, -8.0));
            /* put */ (timeZoneGeographicPoints["Africa/Banjul"] = new Compass.GeographicPoint(13.453055, -16.5775));
            /* put */ (timeZoneGeographicPoints["Africa/Bissau"] = new Compass.GeographicPoint(11.85, -15.583333));
            /* put */ (timeZoneGeographicPoints["Africa/Casablanca"] = new Compass.GeographicPoint(33.593056, -7.616389));
            /* put */ (timeZoneGeographicPoints["Africa/Conakry"] = new Compass.GeographicPoint(9.509167, -13.712222));
            /* put */ (timeZoneGeographicPoints["Africa/Dakar"] = new Compass.GeographicPoint(14.670834, -17.438055));
            /* put */ (timeZoneGeographicPoints["Africa/El_Aaiun"] = new Compass.GeographicPoint(27.15361, -13.203333));
            /* put */ (timeZoneGeographicPoints["Africa/Freetown"] = new Compass.GeographicPoint(8.49, -13.234167));
            /* put */ (timeZoneGeographicPoints["Africa/Lome"] = new Compass.GeographicPoint(6.131944, 1.2227778));
            /* put */ (timeZoneGeographicPoints["Africa/Monrovia"] = new Compass.GeographicPoint(6.3105555, -10.804722));
            /* put */ (timeZoneGeographicPoints["Africa/Nouakchott"] = new Compass.GeographicPoint(18.08639, -15.975278));
            /* put */ (timeZoneGeographicPoints["Africa/Ouagadougou"] = new Compass.GeographicPoint(12.370277, -1.5247222));
            /* put */ (timeZoneGeographicPoints["Africa/Sao_Tome"] = new Compass.GeographicPoint(0.3333333, 6.733333));
            /* put */ (timeZoneGeographicPoints["Africa/Timbuktu"] = new Compass.GeographicPoint(16.766666, -3.0166667));
            /* put */ (timeZoneGeographicPoints["America/Danmarkshavn"] = new Compass.GeographicPoint(76.767, 18.667));
            /* put */ (timeZoneGeographicPoints["Atlantic/Canary"] = new Compass.GeographicPoint(28.45, -16.233334));
            /* put */ (timeZoneGeographicPoints["Atlantic/Faeroe"] = new Compass.GeographicPoint(62.016666, -6.766667));
            /* put */ (timeZoneGeographicPoints["Atlantic/Faroe"] = new Compass.GeographicPoint(62.016666, -6.766667));
            /* put */ (timeZoneGeographicPoints["Atlantic/Madeira"] = new Compass.GeographicPoint(32.633335, -16.9));
            /* put */ (timeZoneGeographicPoints["Atlantic/Reykjavik"] = new Compass.GeographicPoint(64.15, -21.95));
            /* put */ (timeZoneGeographicPoints["Atlantic/St_Helena"] = new Compass.GeographicPoint(-15.933333, -5.7166667));
            var greenwich = new Compass.GeographicPoint(51.466667, 0.0);
            /* put */ (timeZoneGeographicPoints["Etc/GMT"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Etc/GMT+0"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Etc/GMT-0"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Etc/GMT0"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Etc/Greenwich"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Etc/UCT"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Etc/UTC"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Etc/Universal"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Etc/Zulu"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Europe/Belfast"] = new Compass.GeographicPoint(54.583332, -5.933333));
            /* put */ (timeZoneGeographicPoints["Europe/Dublin"] = new Compass.GeographicPoint(53.333057, -6.248889));
            /* put */ (timeZoneGeographicPoints["Europe/Guernsey"] = new Compass.GeographicPoint(49.45, -2.533));
            /* put */ (timeZoneGeographicPoints["Europe/Isle_of_Man"] = new Compass.GeographicPoint(54.14521, -4.48172));
            /* put */ (timeZoneGeographicPoints["Europe/Jersey"] = new Compass.GeographicPoint(49.2, -2.117));
            /* put */ (timeZoneGeographicPoints["Europe/Lisbon"] = new Compass.GeographicPoint(38.716667, -9.133333));
            /* put */ (timeZoneGeographicPoints["Europe/London"] = new Compass.GeographicPoint(51.5, -0.116667));
            /* put */ (timeZoneGeographicPoints["Africa/Algiers"] = new Compass.GeographicPoint(36.763054, 3.0505557));
            /* put */ (timeZoneGeographicPoints["Africa/Bangui"] = new Compass.GeographicPoint(4.366667, 18.583334));
            /* put */ (timeZoneGeographicPoints["Africa/Brazzaville"] = new Compass.GeographicPoint(-4.2591667, 15.284722));
            /* put */ (timeZoneGeographicPoints["Africa/Ceuta"] = new Compass.GeographicPoint(35.890278, -5.3075));
            /* put */ (timeZoneGeographicPoints["Africa/Douala"] = new Compass.GeographicPoint(4.0502777, 9.7));
            /* put */ (timeZoneGeographicPoints["Africa/Kinshasa"] = new Compass.GeographicPoint(-4.3, 15.3));
            /* put */ (timeZoneGeographicPoints["Africa/Lagos"] = new Compass.GeographicPoint(6.4530554, 3.3958333));
            /* put */ (timeZoneGeographicPoints["Africa/Libreville"] = new Compass.GeographicPoint(0.3833333, 9.45));
            /* put */ (timeZoneGeographicPoints["Africa/Luanda"] = new Compass.GeographicPoint(-8.838333, 13.234445));
            /* put */ (timeZoneGeographicPoints["Africa/Malabo"] = new Compass.GeographicPoint(3.75, 8.783333));
            /* put */ (timeZoneGeographicPoints["Africa/Ndjamena"] = new Compass.GeographicPoint(12.113055, 15.049167));
            /* put */ (timeZoneGeographicPoints["Africa/Niamey"] = new Compass.GeographicPoint(13.516666, 2.1166668));
            /* put */ (timeZoneGeographicPoints["Africa/Porto-Novo"] = new Compass.GeographicPoint(6.483333, 2.6166668));
            /* put */ (timeZoneGeographicPoints["Africa/Tunis"] = new Compass.GeographicPoint(36.802776, 10.179722));
            /* put */ (timeZoneGeographicPoints["Africa/Windhoek"] = new Compass.GeographicPoint(-22.57, 17.08361));
            /* put */ (timeZoneGeographicPoints["Arctic/Longyearbyen"] = new Compass.GeographicPoint(78.21667, 15.633333));
            /* put */ (timeZoneGeographicPoints["Atlantic/Jan_Mayen"] = new Compass.GeographicPoint(71.0, -8.333));
            var paris = new Compass.GeographicPoint(48.86667, 2.333333);
            /* put */ (timeZoneGeographicPoints["Etc/GMT-1"] = paris);
            /* put */ (timeZoneGeographicPoints["Europe/Amsterdam"] = new Compass.GeographicPoint(52.35, 4.9166665));
            /* put */ (timeZoneGeographicPoints["Europe/Andorra"] = new Compass.GeographicPoint(42.5, 1.5166667));
            /* put */ (timeZoneGeographicPoints["Europe/Belgrade"] = new Compass.GeographicPoint(44.81861, 20.468056));
            /* put */ (timeZoneGeographicPoints["Europe/Berlin"] = new Compass.GeographicPoint(52.516666, 13.4));
            /* put */ (timeZoneGeographicPoints["Europe/Bratislava"] = new Compass.GeographicPoint(48.15, 17.116667));
            /* put */ (timeZoneGeographicPoints["Europe/Brussels"] = new Compass.GeographicPoint(50.833332, 4.333333));
            /* put */ (timeZoneGeographicPoints["Europe/Budapest"] = new Compass.GeographicPoint(47.5, 19.083334));
            /* put */ (timeZoneGeographicPoints["Europe/Copenhagen"] = new Compass.GeographicPoint(55.666668, 12.583333));
            /* put */ (timeZoneGeographicPoints["Europe/Gibraltar"] = new Compass.GeographicPoint(36.133335, -5.35));
            /* put */ (timeZoneGeographicPoints["Europe/Ljubljana"] = new Compass.GeographicPoint(46.05528, 14.514444));
            /* put */ (timeZoneGeographicPoints["Europe/Luxembourg"] = new Compass.GeographicPoint(49.611668, 6.13));
            /* put */ (timeZoneGeographicPoints["Europe/Madrid"] = new Compass.GeographicPoint(40.4, -3.6833334));
            /* put */ (timeZoneGeographicPoints["Europe/Malta"] = new Compass.GeographicPoint(35.899723, 14.514722));
            /* put */ (timeZoneGeographicPoints["Europe/Monaco"] = new Compass.GeographicPoint(43.733334, 7.4166665));
            /* put */ (timeZoneGeographicPoints["Europe/Oslo"] = new Compass.GeographicPoint(59.916668, 10.75));
            /* put */ (timeZoneGeographicPoints["Europe/Paris"] = paris);
            /* put */ (timeZoneGeographicPoints["Europe/Podgorica"] = new Compass.GeographicPoint(42.441113, 19.26361));
            /* put */ (timeZoneGeographicPoints["Europe/Prague"] = new Compass.GeographicPoint(50.083332, 14.466667));
            /* put */ (timeZoneGeographicPoints["Europe/Rome"] = new Compass.GeographicPoint(41.9, 12.483334));
            /* put */ (timeZoneGeographicPoints["Europe/San_Marino"] = new Compass.GeographicPoint(43.933334, 12.45));
            /* put */ (timeZoneGeographicPoints["Europe/Sarajevo"] = new Compass.GeographicPoint(43.85, 18.383333));
            /* put */ (timeZoneGeographicPoints["Europe/Skopje"] = new Compass.GeographicPoint(42.0, 21.433332));
            /* put */ (timeZoneGeographicPoints["Europe/Stockholm"] = new Compass.GeographicPoint(59.333332, 18.05));
            /* put */ (timeZoneGeographicPoints["Europe/Tirane"] = new Compass.GeographicPoint(41.3275, 19.81889));
            /* put */ (timeZoneGeographicPoints["Europe/Vaduz"] = new Compass.GeographicPoint(47.133335, 9.516666));
            /* put */ (timeZoneGeographicPoints["Europe/Vatican"] = new Compass.GeographicPoint(41.9, 12.45));
            /* put */ (timeZoneGeographicPoints["Europe/Vienna"] = new Compass.GeographicPoint(48.2, 16.366667));
            /* put */ (timeZoneGeographicPoints["Europe/Warsaw"] = new Compass.GeographicPoint(52.25, 21.0));
            /* put */ (timeZoneGeographicPoints["Europe/Zagreb"] = new Compass.GeographicPoint(45.8, 16.0));
            /* put */ (timeZoneGeographicPoints["Europe/Zurich"] = new Compass.GeographicPoint(47.366665, 8.55));
            /* put */ (timeZoneGeographicPoints["Africa/Blantyre"] = new Compass.GeographicPoint(-15.783333, 35.0));
            /* put */ (timeZoneGeographicPoints["Africa/Bujumbura"] = new Compass.GeographicPoint(-3.376111, 29.36));
            /* put */ (timeZoneGeographicPoints["Africa/Cairo"] = new Compass.GeographicPoint(30.05, 31.25));
            /* put */ (timeZoneGeographicPoints["Africa/Gaborone"] = new Compass.GeographicPoint(-24.646389, 25.911945));
            /* put */ (timeZoneGeographicPoints["Africa/Harare"] = new Compass.GeographicPoint(-17.817778, 31.044722));
            /* put */ (timeZoneGeographicPoints["Africa/Johannesburg"] = new Compass.GeographicPoint(-26.2, 28.083334));
            /* put */ (timeZoneGeographicPoints["Africa/Kigali"] = new Compass.GeographicPoint(-1.9536111, 30.060556));
            /* put */ (timeZoneGeographicPoints["Africa/Lubumbashi"] = new Compass.GeographicPoint(-11.666667, 27.466667));
            /* put */ (timeZoneGeographicPoints["Africa/Lusaka"] = new Compass.GeographicPoint(-15.416667, 28.283333));
            /* put */ (timeZoneGeographicPoints["Africa/Maputo"] = new Compass.GeographicPoint(-25.965279, 32.58917));
            /* put */ (timeZoneGeographicPoints["Africa/Maseru"] = new Compass.GeographicPoint(-29.316668, 27.483334));
            /* put */ (timeZoneGeographicPoints["Africa/Mbabane"] = new Compass.GeographicPoint(-26.316668, 31.133333));
            /* put */ (timeZoneGeographicPoints["Africa/Tripoli"] = new Compass.GeographicPoint(32.8925, 13.18));
            /* put */ (timeZoneGeographicPoints["Asia/Amman"] = new Compass.GeographicPoint(31.95, 35.933334));
            /* put */ (timeZoneGeographicPoints["Asia/Beirut"] = new Compass.GeographicPoint(33.871944, 35.509724));
            /* put */ (timeZoneGeographicPoints["Asia/Damascus"] = new Compass.GeographicPoint(33.5, 36.3));
            /* put */ (timeZoneGeographicPoints["Asia/Gaza"] = new Compass.GeographicPoint(31.5, 34.466667));
            /* put */ (timeZoneGeographicPoints["Asia/Istanbul"] = new Compass.GeographicPoint(41.018612, 28.964722));
            /* put */ (timeZoneGeographicPoints["Asia/Jerusalem"] = new Compass.GeographicPoint(31.78, 35.23));
            /* put */ (timeZoneGeographicPoints["Asia/Nicosia"] = new Compass.GeographicPoint(35.166668, 33.366665));
            /* put */ (timeZoneGeographicPoints["Asia/Tel_Aviv"] = new Compass.GeographicPoint(32.066666, 34.766666));
            var athens = new Compass.GeographicPoint(37.983334, 23.733334);
            /* put */ (timeZoneGeographicPoints["Etc/GMT-2"] = athens);
            /* put */ (timeZoneGeographicPoints["Europe/Athens"] = new Compass.GeographicPoint(37.983334, 23.733334));
            /* put */ (timeZoneGeographicPoints["Europe/Bucharest"] = new Compass.GeographicPoint(44.433334, 26.1));
            /* put */ (timeZoneGeographicPoints["Europe/Chisinau"] = new Compass.GeographicPoint(47.005554, 28.8575));
            /* put */ (timeZoneGeographicPoints["Europe/Helsinki"] = new Compass.GeographicPoint(60.175556, 24.934166));
            /* put */ (timeZoneGeographicPoints["Europe/Istanbul"] = new Compass.GeographicPoint(41.018612, 28.964722));
            /* put */ (timeZoneGeographicPoints["Europe/Kaliningrad"] = new Compass.GeographicPoint(54.71, 20.5));
            /* put */ (timeZoneGeographicPoints["Europe/Kiev"] = new Compass.GeographicPoint(50.433334, 30.516666));
            /* put */ (timeZoneGeographicPoints["Europe/Mariehamn"] = new Compass.GeographicPoint(60.1, 19.95));
            /* put */ (timeZoneGeographicPoints["Europe/Minsk"] = new Compass.GeographicPoint(53.9, 27.566668));
            /* put */ (timeZoneGeographicPoints["Europe/Nicosia"] = new Compass.GeographicPoint(35.166668, 33.366665));
            /* put */ (timeZoneGeographicPoints["Europe/Riga"] = new Compass.GeographicPoint(56.95, 24.1));
            /* put */ (timeZoneGeographicPoints["Europe/Simferopol"] = new Compass.GeographicPoint(44.95, 34.1));
            /* put */ (timeZoneGeographicPoints["Europe/Sofia"] = new Compass.GeographicPoint(42.683334, 23.316668));
            /* put */ (timeZoneGeographicPoints["Europe/Tallinn"] = new Compass.GeographicPoint(59.433887, 24.728056));
            /* put */ (timeZoneGeographicPoints["Europe/Tiraspol"] = new Compass.GeographicPoint(46.84028, 29.643333));
            /* put */ (timeZoneGeographicPoints["Europe/Uzhgorod"] = new Compass.GeographicPoint(48.616665, 22.3));
            /* put */ (timeZoneGeographicPoints["Europe/Vilnius"] = new Compass.GeographicPoint(54.683334, 25.316668));
            /* put */ (timeZoneGeographicPoints["Europe/Zaporozhye"] = new Compass.GeographicPoint(47.833, 35.1667));
            /* put */ (timeZoneGeographicPoints["Africa/Addis_Ababa"] = new Compass.GeographicPoint(9.033333, 38.7));
            /* put */ (timeZoneGeographicPoints["Africa/Asmara"] = new Compass.GeographicPoint(15.333333, 38.933334));
            /* put */ (timeZoneGeographicPoints["Africa/Asmera"] = new Compass.GeographicPoint(15.333333, 38.933334));
            /* put */ (timeZoneGeographicPoints["Africa/Dar_es_Salaam"] = new Compass.GeographicPoint(-6.8, 39.283333));
            /* put */ (timeZoneGeographicPoints["Africa/Djibouti"] = new Compass.GeographicPoint(11.595, 43.148056));
            /* put */ (timeZoneGeographicPoints["Africa/Kampala"] = new Compass.GeographicPoint(0.3155556, 32.565556));
            /* put */ (timeZoneGeographicPoints["Africa/Khartoum"] = new Compass.GeographicPoint(15.588056, 32.53417));
            /* put */ (timeZoneGeographicPoints["Africa/Mogadishu"] = new Compass.GeographicPoint(2.0666666, 45.366665));
            /* put */ (timeZoneGeographicPoints["Africa/Nairobi"] = new Compass.GeographicPoint(-1.2833333, 36.816666));
            /* put */ (timeZoneGeographicPoints["Antarctica/Syowa"] = new Compass.GeographicPoint(-69.0, 39.5833));
            /* put */ (timeZoneGeographicPoints["Asia/Aden"] = new Compass.GeographicPoint(12.779445, 45.036667));
            /* put */ (timeZoneGeographicPoints["Asia/Baghdad"] = new Compass.GeographicPoint(33.33861, 44.39389));
            /* put */ (timeZoneGeographicPoints["Asia/Bahrain"] = new Compass.GeographicPoint(26.23611, 50.583057));
            /* put */ (timeZoneGeographicPoints["Asia/Kuwait"] = new Compass.GeographicPoint(29.369722, 47.978333));
            /* put */ (timeZoneGeographicPoints["Asia/Qatar"] = new Compass.GeographicPoint(25.286667, 51.533333));
            /* put */ (timeZoneGeographicPoints["Asia/Riyadh"] = new Compass.GeographicPoint(24.640833, 46.772778));
            var moscow = new Compass.GeographicPoint(55.752224, 37.615555);
            /* put */ (timeZoneGeographicPoints["Etc/GMT-3"] = moscow);
            /* put */ (timeZoneGeographicPoints["Europe/Moscow"] = moscow);
            /* put */ (timeZoneGeographicPoints["Europe/Volgograd"] = new Compass.GeographicPoint(48.80472, 44.585835));
            /* put */ (timeZoneGeographicPoints["Indian/Antananarivo"] = new Compass.GeographicPoint(-18.916666, 47.516666));
            /* put */ (timeZoneGeographicPoints["Indian/Comoro"] = new Compass.GeographicPoint(-11.704166, 43.240276));
            /* put */ (timeZoneGeographicPoints["Indian/Mayotte"] = new Compass.GeographicPoint(-12.779445, 45.227222));
            /* put */ (timeZoneGeographicPoints["Asia/Riyadh87"] = new Compass.GeographicPoint(24.640833, 46.772778));
            /* put */ (timeZoneGeographicPoints["Asia/Riyadh88"] = new Compass.GeographicPoint(24.640833, 46.772778));
            /* put */ (timeZoneGeographicPoints["Asia/Riyadh89"] = new Compass.GeographicPoint(24.640833, 46.772778));
            /* put */ (timeZoneGeographicPoints["Mideast/Riyadh87"] = new Compass.GeographicPoint(24.640833, 46.772778));
            /* put */ (timeZoneGeographicPoints["Mideast/Riyadh88"] = new Compass.GeographicPoint(24.640833, 46.772778));
            /* put */ (timeZoneGeographicPoints["Mideast/Riyadh89"] = new Compass.GeographicPoint(24.640833, 46.772778));
            /* put */ (timeZoneGeographicPoints["Asia/Tehran"] = new Compass.GeographicPoint(35.671944, 51.424446));
            /* put */ (timeZoneGeographicPoints["Asia/Baku"] = new Compass.GeographicPoint(40.39528, 49.88222));
            var dubai = new Compass.GeographicPoint(25.252222, 55.28);
            /* put */ (timeZoneGeographicPoints["Asia/Dubai"] = dubai);
            /* put */ (timeZoneGeographicPoints["Asia/Muscat"] = new Compass.GeographicPoint(23.613333, 58.593334));
            /* put */ (timeZoneGeographicPoints["Asia/Tbilisi"] = new Compass.GeographicPoint(41.725, 44.790833));
            /* put */ (timeZoneGeographicPoints["Asia/Yerevan"] = new Compass.GeographicPoint(40.18111, 44.51361));
            /* put */ (timeZoneGeographicPoints["Etc/GMT-4"] = dubai);
            /* put */ (timeZoneGeographicPoints["Europe/Samara"] = new Compass.GeographicPoint(53.2, 50.15));
            /* put */ (timeZoneGeographicPoints["Indian/Mahe"] = new Compass.GeographicPoint(-4.616667, 55.45));
            /* put */ (timeZoneGeographicPoints["Indian/Mauritius"] = new Compass.GeographicPoint(-20.161945, 57.49889));
            /* put */ (timeZoneGeographicPoints["Indian/Reunion"] = new Compass.GeographicPoint(-20.866667, 55.466667));
            /* put */ (timeZoneGeographicPoints["Asia/Kabul"] = new Compass.GeographicPoint(34.516666, 69.183334));
            /* put */ (timeZoneGeographicPoints["Antarctica/Davis"] = new Compass.GeographicPoint(-68.5764, 77.9689));
            /* put */ (timeZoneGeographicPoints["Antarctica/Mawson"] = new Compass.GeographicPoint(-53.104, 73.514));
            /* put */ (timeZoneGeographicPoints["Asia/Aqtau"] = new Compass.GeographicPoint(43.65, 51.2));
            /* put */ (timeZoneGeographicPoints["Asia/Aqtobe"] = new Compass.GeographicPoint(50.298054, 57.18139));
            /* put */ (timeZoneGeographicPoints["Asia/Ashgabat"] = new Compass.GeographicPoint(37.95, 58.383335));
            /* put */ (timeZoneGeographicPoints["Asia/Ashkhabad"] = new Compass.GeographicPoint(37.95, 58.383335));
            /* put */ (timeZoneGeographicPoints["Asia/Dushanbe"] = new Compass.GeographicPoint(38.56, 68.77389));
            /* put */ (timeZoneGeographicPoints["Asia/Karachi"] = new Compass.GeographicPoint(24.866667, 67.05));
            /* put */ (timeZoneGeographicPoints["Asia/Oral"] = new Compass.GeographicPoint(51.233334, 51.366665));
            /* put */ (timeZoneGeographicPoints["Asia/Samarkand"] = new Compass.GeographicPoint(39.654167, 66.959724));
            /* put */ (timeZoneGeographicPoints["Asia/Tashkent"] = new Compass.GeographicPoint(41.316666, 69.25));
            /* put */ (timeZoneGeographicPoints["Asia/Yekaterinburg"] = new Compass.GeographicPoint(56.85, 60.6));
            var calcutta = new Compass.GeographicPoint(22.569721, 88.36972);
            /* put */ (timeZoneGeographicPoints["Etc/GMT-5"] = calcutta);
            /* put */ (timeZoneGeographicPoints["Indian/Kerguelen"] = new Compass.GeographicPoint(-49.25, 69.583));
            /* put */ (timeZoneGeographicPoints["Indian/Maldives"] = new Compass.GeographicPoint(4.1666665, 73.5));
            /* put */ (timeZoneGeographicPoints["Asia/Calcutta"] = calcutta);
            /* put */ (timeZoneGeographicPoints["Asia/Colombo"] = new Compass.GeographicPoint(6.9319444, 79.84778));
            /* put */ (timeZoneGeographicPoints["Asia/Kolkata"] = calcutta);
            /* put */ (timeZoneGeographicPoints["Asia/Kathmandu"] = new Compass.GeographicPoint(27.716667, 85.316666));
            /* put */ (timeZoneGeographicPoints["Asia/Katmandu"] = new Compass.GeographicPoint(27.716667, 85.316666));
            /* put */ (timeZoneGeographicPoints["Antarctica/Vostok"] = new Compass.GeographicPoint(-78.4644, 106.8372));
            /* put */ (timeZoneGeographicPoints["Asia/Almaty"] = new Compass.GeographicPoint(43.25, 76.95));
            /* put */ (timeZoneGeographicPoints["Asia/Bishkek"] = new Compass.GeographicPoint(42.873055, 74.60028));
            var dacca = new Compass.GeographicPoint(23.723055, 90.40861);
            /* put */ (timeZoneGeographicPoints["Asia/Dacca"] = dacca);
            /* put */ (timeZoneGeographicPoints["Asia/Dhaka"] = dacca);
            /* put */ (timeZoneGeographicPoints["Asia/Novokuznetsk"] = new Compass.GeographicPoint(53.75, 87.1));
            /* put */ (timeZoneGeographicPoints["Asia/Novosibirsk"] = new Compass.GeographicPoint(55.04111, 82.93444));
            /* put */ (timeZoneGeographicPoints["Asia/Omsk"] = new Compass.GeographicPoint(55.0, 73.4));
            /* put */ (timeZoneGeographicPoints["Asia/Qyzylorda"] = new Compass.GeographicPoint(44.85278, 65.50916));
            /* put */ (timeZoneGeographicPoints["Asia/Thimbu"] = new Compass.GeographicPoint(27.483334, 89.6));
            /* put */ (timeZoneGeographicPoints["Asia/Thimphu"] = new Compass.GeographicPoint(27.483334, 89.6));
            /* put */ (timeZoneGeographicPoints["Etc/GMT-6"] = dacca);
            /* put */ (timeZoneGeographicPoints["Indian/Chagos"] = new Compass.GeographicPoint(-6.0, 71.5));
            /* put */ (timeZoneGeographicPoints["Asia/Rangoon"] = new Compass.GeographicPoint(16.783333, 96.166664));
            /* put */ (timeZoneGeographicPoints["Indian/Cocos"] = new Compass.GeographicPoint(-12.1167, 96.9));
            var bangkok = new Compass.GeographicPoint(13.75, 100.51667);
            /* put */ (timeZoneGeographicPoints["Asia/Bangkok"] = bangkok);
            /* put */ (timeZoneGeographicPoints["Asia/Ho_Chi_Minh"] = new Compass.GeographicPoint(10.75, 106.666664));
            /* put */ (timeZoneGeographicPoints["Asia/Hovd"] = new Compass.GeographicPoint(48.016666, 91.63333));
            /* put */ (timeZoneGeographicPoints["Asia/Jakarta"] = new Compass.GeographicPoint(-6.174444, 106.829445));
            /* put */ (timeZoneGeographicPoints["Asia/Krasnoyarsk"] = new Compass.GeographicPoint(56.009724, 92.791664));
            /* put */ (timeZoneGeographicPoints["Asia/Phnom_Penh"] = new Compass.GeographicPoint(11.55, 104.916664));
            /* put */ (timeZoneGeographicPoints["Asia/Pontianak"] = new Compass.GeographicPoint(-0.0333333, 109.333336));
            /* put */ (timeZoneGeographicPoints["Asia/Saigon"] = new Compass.GeographicPoint(10.75, 106.666664));
            /* put */ (timeZoneGeographicPoints["Asia/Vientiane"] = new Compass.GeographicPoint(17.966667, 102.6));
            /* put */ (timeZoneGeographicPoints["Etc/GMT-7"] = bangkok);
            /* put */ (timeZoneGeographicPoints["Indian/Christmas"] = new Compass.GeographicPoint(-10.416667, 105.71667));
            /* put */ (timeZoneGeographicPoints["Asia/Brunei"] = new Compass.GeographicPoint(4.883333, 114.933334));
            /* put */ (timeZoneGeographicPoints["Asia/Choibalsan"] = new Compass.GeographicPoint(48.066666, 114.5));
            /* put */ (timeZoneGeographicPoints["Asia/Chongqing"] = new Compass.GeographicPoint(29.562778, 106.55278));
            /* put */ (timeZoneGeographicPoints["Asia/Chungking"] = new Compass.GeographicPoint(29.562778, 106.55278));
            /* put */ (timeZoneGeographicPoints["Asia/Harbin"] = new Compass.GeographicPoint(45.75, 126.65));
            /* put */ (timeZoneGeographicPoints["Asia/Hong_Kong"] = new Compass.GeographicPoint(22.283333, 114.15));
            /* put */ (timeZoneGeographicPoints["Asia/Irkutsk"] = new Compass.GeographicPoint(52.266666, 104.333336));
            /* put */ (timeZoneGeographicPoints["Asia/Kashgar"] = new Compass.GeographicPoint(39.391388, 76.04));
            /* put */ (timeZoneGeographicPoints["Asia/Kuala_Lumpur"] = new Compass.GeographicPoint(3.1666667, 101.7));
            /* put */ (timeZoneGeographicPoints["Asia/Kuching"] = new Compass.GeographicPoint(1.55, 110.333336));
            /* put */ (timeZoneGeographicPoints["Asia/Macao"] = new Compass.GeographicPoint(22.2, 113.55));
            /* put */ (timeZoneGeographicPoints["Asia/Macau"] = new Compass.GeographicPoint(22.2, 113.55));
            /* put */ (timeZoneGeographicPoints["Asia/Makassar"] = new Compass.GeographicPoint(2.45, 99.78333));
            /* put */ (timeZoneGeographicPoints["Asia/Manila"] = new Compass.GeographicPoint(14.604167, 120.98222));
            var shanghai = new Compass.GeographicPoint(31.005, 121.40861);
            /* put */ (timeZoneGeographicPoints["Asia/Shanghai"] = shanghai);
            /* put */ (timeZoneGeographicPoints["Asia/Singapore"] = new Compass.GeographicPoint(1.2930557, 103.855835));
            /* put */ (timeZoneGeographicPoints["Asia/Taipei"] = new Compass.GeographicPoint(25.039167, 121.525));
            /* put */ (timeZoneGeographicPoints["Asia/Ujung_Pandang"] = new Compass.GeographicPoint(-5.1305556, 119.406944));
            /* put */ (timeZoneGeographicPoints["Asia/Ulaanbaatar"] = new Compass.GeographicPoint(47.916668, 106.916664));
            /* put */ (timeZoneGeographicPoints["Asia/Ulan_Bator"] = new Compass.GeographicPoint(47.916668, 106.916664));
            /* put */ (timeZoneGeographicPoints["Asia/Urumqi"] = new Compass.GeographicPoint(43.8, 87.583336));
            /* put */ (timeZoneGeographicPoints["Australia/Perth"] = new Compass.GeographicPoint(-31.933332, 115.833336));
            /* put */ (timeZoneGeographicPoints["Australia/West"] = new Compass.GeographicPoint(-31.933332, 115.833336));
            /* put */ (timeZoneGeographicPoints["Etc/GMT-8"] = shanghai);
            /* put */ (timeZoneGeographicPoints["Australia/Eucla"] = new Compass.GeographicPoint(-31.716667, 128.86667));
            /* put */ (timeZoneGeographicPoints["Asia/Dili"] = new Compass.GeographicPoint(-8.55, 125.5833));
            /* put */ (timeZoneGeographicPoints["Asia/Jayapura"] = new Compass.GeographicPoint(-2.5333333, 140.7));
            /* put */ (timeZoneGeographicPoints["Asia/Pyongyang"] = new Compass.GeographicPoint(39.019444, 125.75472));
            /* put */ (timeZoneGeographicPoints["Asia/Seoul"] = new Compass.GeographicPoint(37.566387, 126.999725));
            var tokyo = new Compass.GeographicPoint(35.685, 139.75139);
            /* put */ (timeZoneGeographicPoints["Asia/Tokyo"] = tokyo);
            /* put */ (timeZoneGeographicPoints["Asia/Yakutsk"] = new Compass.GeographicPoint(62.03389, 129.73306));
            /* put */ (timeZoneGeographicPoints["Etc/GMT-9"] = tokyo);
            /* put */ (timeZoneGeographicPoints["Pacific/Palau"] = new Compass.GeographicPoint(7.5, 134.6241));
            /* put */ (timeZoneGeographicPoints["Australia/Adelaide"] = new Compass.GeographicPoint(-34.933334, 138.6));
            /* put */ (timeZoneGeographicPoints["Australia/Broken_Hill"] = new Compass.GeographicPoint(-31.95, 141.43333));
            /* put */ (timeZoneGeographicPoints["Australia/Darwin"] = new Compass.GeographicPoint(-12.466667, 130.83333));
            /* put */ (timeZoneGeographicPoints["Australia/North"] = new Compass.GeographicPoint(-12.466667, 130.83333));
            /* put */ (timeZoneGeographicPoints["Australia/South"] = new Compass.GeographicPoint(-34.933334, 138.6));
            /* put */ (timeZoneGeographicPoints["Australia/Yancowinna"] = new Compass.GeographicPoint(-31.7581, 141.7178));
            /* put */ (timeZoneGeographicPoints["Antarctica/DumontDUrville"] = new Compass.GeographicPoint(-66.66277, 140.0014));
            /* put */ (timeZoneGeographicPoints["Asia/Sakhalin"] = new Compass.GeographicPoint(51.0, 143.0));
            /* put */ (timeZoneGeographicPoints["Asia/Vladivostok"] = new Compass.GeographicPoint(43.133335, 131.9));
            /* put */ (timeZoneGeographicPoints["Australia/ACT"] = new Compass.GeographicPoint(-35.283333, 149.21666));
            /* put */ (timeZoneGeographicPoints["Australia/Brisbane"] = new Compass.GeographicPoint(-27.5, 153.01666));
            /* put */ (timeZoneGeographicPoints["Australia/Canberra"] = new Compass.GeographicPoint(-35.283333, 149.21666));
            /* put */ (timeZoneGeographicPoints["Australia/Currie"] = new Compass.GeographicPoint(-39.933334, 143.86667));
            /* put */ (timeZoneGeographicPoints["Australia/Hobart"] = new Compass.GeographicPoint(-42.916668, 147.33333));
            /* put */ (timeZoneGeographicPoints["Australia/Lindeman"] = new Compass.GeographicPoint(-20.45, 149.0333));
            /* put */ (timeZoneGeographicPoints["Australia/Melbourne"] = new Compass.GeographicPoint(-37.816666, 144.96666));
            var sydney = new Compass.GeographicPoint(-33.88333, 151.21666);
            /* put */ (timeZoneGeographicPoints["Australia/NSW"] = sydney);
            /* put */ (timeZoneGeographicPoints["Australia/Queensland"] = new Compass.GeographicPoint(-27.5, 153.01666));
            /* put */ (timeZoneGeographicPoints["Australia/Sydney"] = sydney);
            /* put */ (timeZoneGeographicPoints["Australia/Tasmania"] = new Compass.GeographicPoint(-42.916668, 147.33333));
            /* put */ (timeZoneGeographicPoints["Australia/Victoria"] = new Compass.GeographicPoint(-37.816666, 144.96666));
            /* put */ (timeZoneGeographicPoints["Etc/GMT-10"] = sydney);
            /* put */ (timeZoneGeographicPoints["Pacific/Guam"] = new Compass.GeographicPoint(13.467, 144.75));
            /* put */ (timeZoneGeographicPoints["Pacific/Port_Moresby"] = new Compass.GeographicPoint(-9.464723, 147.1925));
            /* put */ (timeZoneGeographicPoints["Pacific/Saipan"] = new Compass.GeographicPoint(15.1833, 145.75));
            /* put */ (timeZoneGeographicPoints["Pacific/Truk"] = new Compass.GeographicPoint(7.4167, 151.7833));
            /* put */ (timeZoneGeographicPoints["Pacific/Yap"] = new Compass.GeographicPoint(9.514444, 138.12917));
            /* put */ (timeZoneGeographicPoints["Australia/LHI"] = new Compass.GeographicPoint(-31.55, 159.083));
            /* put */ (timeZoneGeographicPoints["Australia/Lord_Howe"] = new Compass.GeographicPoint(-31.55, 159.083));
            /* put */ (timeZoneGeographicPoints["Antarctica/Casey"] = new Compass.GeographicPoint(-66.2833, 110.5333));
            /* put */ (timeZoneGeographicPoints["Asia/Magadan"] = new Compass.GeographicPoint(59.566666, 150.8));
            var noumea = new Compass.GeographicPoint(-22.266666, 166.45);
            /* put */ (timeZoneGeographicPoints["Etc/GMT-11"] = noumea);
            /* put */ (timeZoneGeographicPoints["Pacific/Efate"] = new Compass.GeographicPoint(-17.667, 168.417));
            /* put */ (timeZoneGeographicPoints["Pacific/Guadalcanal"] = new Compass.GeographicPoint(-9.617, 160.183));
            /* put */ (timeZoneGeographicPoints["Pacific/Kosrae"] = new Compass.GeographicPoint(5.317, 162.983));
            /* put */ (timeZoneGeographicPoints["Pacific/Noumea"] = noumea);
            /* put */ (timeZoneGeographicPoints["Pacific/Ponape"] = new Compass.GeographicPoint(6.963889, 158.20833));
            /* put */ (timeZoneGeographicPoints["Pacific/Norfolk"] = new Compass.GeographicPoint(-29.05, 167.95));
            /* put */ (timeZoneGeographicPoints["Antarctica/McMurdo"] = new Compass.GeographicPoint(-77.85, 166.667));
            /* put */ (timeZoneGeographicPoints["Antarctica/South_Pole"] = new Compass.GeographicPoint(-90.0, 0.0));
            /* put */ (timeZoneGeographicPoints["Asia/Anadyr"] = new Compass.GeographicPoint(64.75, 177.48334));
            /* put */ (timeZoneGeographicPoints["Asia/Kamchatka"] = new Compass.GeographicPoint(57.0, 160.0));
            var auckland = new Compass.GeographicPoint(-36.86667, 174.76666);
            /* put */ (timeZoneGeographicPoints["Etc/GMT-12"] = auckland);
            /* put */ (timeZoneGeographicPoints["Pacific/Auckland"] = auckland);
            /* put */ (timeZoneGeographicPoints["Pacific/Fiji"] = new Compass.GeographicPoint(-18.133333, 178.41667));
            /* put */ (timeZoneGeographicPoints["Pacific/Funafuti"] = new Compass.GeographicPoint(-8.516666, 179.21666));
            /* put */ (timeZoneGeographicPoints["Pacific/Kwajalein"] = new Compass.GeographicPoint(9.1939, 167.4597));
            /* put */ (timeZoneGeographicPoints["Pacific/Majuro"] = new Compass.GeographicPoint(7.1, 171.38333));
            /* put */ (timeZoneGeographicPoints["Pacific/Nauru"] = new Compass.GeographicPoint(-0.5322, 166.9328));
            /* put */ (timeZoneGeographicPoints["Pacific/Tarawa"] = new Compass.GeographicPoint(1.4167, 173.0333));
            /* put */ (timeZoneGeographicPoints["Pacific/Wake"] = new Compass.GeographicPoint(19.2833, 166.6));
            /* put */ (timeZoneGeographicPoints["Pacific/Wallis"] = new Compass.GeographicPoint(-13.273, -176.205));
            /* put */ (timeZoneGeographicPoints["Pacific/Chatham"] = new Compass.GeographicPoint(-43.883, -176.517));
            var enderbury = new Compass.GeographicPoint(-3.133, -171.0833);
            /* put */ (timeZoneGeographicPoints["Etc/GMT-13"] = enderbury);
            /* put */ (timeZoneGeographicPoints["Pacific/Enderbury"] = enderbury);
            /* put */ (timeZoneGeographicPoints["Pacific/Tongatapu"] = new Compass.GeographicPoint(-21.2114, -175.153));
            var kiritimati = new Compass.GeographicPoint(1.883, -157.4);
            /* put */ (timeZoneGeographicPoints["Etc/GMT-14"] = kiritimati);
            /* put */ (timeZoneGeographicPoints["Pacific/Kiritimati"] = kiritimati);
            /* put */ (timeZoneGeographicPoints["MIT"] = apia);
            /* put */ (timeZoneGeographicPoints["HST"] = honolulu);
            /* put */ (timeZoneGeographicPoints["PST"] = losAngeles);
            /* put */ (timeZoneGeographicPoints["PST8PDT"] = losAngeles);
            /* put */ (timeZoneGeographicPoints["MST"] = denver);
            /* put */ (timeZoneGeographicPoints["MST7MDT"] = denver);
            /* put */ (timeZoneGeographicPoints["Navajo"] = new Compass.GeographicPoint(35.6728, -109.0622));
            /* put */ (timeZoneGeographicPoints["PNT"] = new Compass.GeographicPoint(33.448334, -112.07333));
            /* put */ (timeZoneGeographicPoints["America/Indiana/Knox"] = new Compass.GeographicPoint(41.295834, -86.625));
            /* put */ (timeZoneGeographicPoints["America/Indiana/Tell_City"] = new Compass.GeographicPoint(37.953, -86.7614));
            /* put */ (timeZoneGeographicPoints["America/North_Dakota/Center"] = new Compass.GeographicPoint(47.115, -101.3003));
            /* put */ (timeZoneGeographicPoints["America/North_Dakota/New_Salem"] = new Compass.GeographicPoint(46.843, 101.4119));
            /* put */ (timeZoneGeographicPoints["CST"] = chicago);
            /* put */ (timeZoneGeographicPoints["CST6CDT"] = chicago);
            /* put */ (timeZoneGeographicPoints["America/Indiana/Indianapolis"] = new Compass.GeographicPoint(39.768333, -86.15806));
            /* put */ (timeZoneGeographicPoints["America/Indiana/Marengo"] = new Compass.GeographicPoint(36.3706, -86.3433));
            /* put */ (timeZoneGeographicPoints["America/Indiana/Petersburg"] = new Compass.GeographicPoint(38.4917, -87.2803));
            /* put */ (timeZoneGeographicPoints["America/Indiana/Vevay"] = new Compass.GeographicPoint(38.7458, -85.0711));
            /* put */ (timeZoneGeographicPoints["America/Indiana/Vincennes"] = new Compass.GeographicPoint(38.6783, -87.5164));
            /* put */ (timeZoneGeographicPoints["America/Indiana/Winamac"] = new Compass.GeographicPoint(41.0525, -86.6044));
            /* put */ (timeZoneGeographicPoints["America/Kentucky/Louisville"] = new Compass.GeographicPoint(38.2542, -85.7603));
            /* put */ (timeZoneGeographicPoints["America/Kentucky/Monticello"] = new Compass.GeographicPoint(36.8381, -84.85));
            /* put */ (timeZoneGeographicPoints["Cuba"] = new Compass.GeographicPoint(23.131945, -82.36417));
            /* put */ (timeZoneGeographicPoints["EST"] = newYork);
            /* put */ (timeZoneGeographicPoints["EST5EDT"] = newYork);
            /* put */ (timeZoneGeographicPoints["IET"] = newYork);
            /* put */ (timeZoneGeographicPoints["AST"] = new Compass.GeographicPoint(44.65, -63.6));
            /* put */ (timeZoneGeographicPoints["Jamaica"] = new Compass.GeographicPoint(18.0, -76.8));
            /* put */ (timeZoneGeographicPoints["America/Argentina/San_Luis"] = new Compass.GeographicPoint(-33.3, -66.333));
            /* put */ (timeZoneGeographicPoints["PRT"] = new Compass.GeographicPoint(18.467, 66.117));
            /* put */ (timeZoneGeographicPoints["CNT"] = new Compass.GeographicPoint(47.5675, -52.7072));
            /* put */ (timeZoneGeographicPoints["AGT"] = new Compass.GeographicPoint(-34.5875, -58.6725));
            /* put */ (timeZoneGeographicPoints["America/Argentina/Buenos_Aires"] = new Compass.GeographicPoint(-34.5875, -58.6725));
            /* put */ (timeZoneGeographicPoints["America/Argentina/Catamarca"] = new Compass.GeographicPoint(-28.466667, -65.78333));
            /* put */ (timeZoneGeographicPoints["America/Argentina/ComodRivadavia"] = new Compass.GeographicPoint(-42.7578, -65.0297));
            /* put */ (timeZoneGeographicPoints["America/Argentina/Cordoba"] = new Compass.GeographicPoint(-31.4, -64.183334));
            /* put */ (timeZoneGeographicPoints["America/Argentina/Jujuy"] = new Compass.GeographicPoint(-24.183332, -65.3));
            /* put */ (timeZoneGeographicPoints["America/Argentina/La_Rioja"] = new Compass.GeographicPoint(-29.4144, -66.8552));
            /* put */ (timeZoneGeographicPoints["America/Argentina/Mendoza"] = new Compass.GeographicPoint(-32.883335, -68.816666));
            /* put */ (timeZoneGeographicPoints["America/Argentina/Rio_Gallegos"] = new Compass.GeographicPoint(-51.625, -69.2286));
            /* put */ (timeZoneGeographicPoints["America/Argentina/Salta"] = new Compass.GeographicPoint(-24.783333, -65.416664));
            /* put */ (timeZoneGeographicPoints["America/Argentina/San_Juan"] = new Compass.GeographicPoint(-31.5333, -68.5167));
            /* put */ (timeZoneGeographicPoints["America/Argentina/Tucuman"] = new Compass.GeographicPoint(-26.8167, 65.2167));
            /* put */ (timeZoneGeographicPoints["America/Argentina/Ushuaia"] = new Compass.GeographicPoint(-54.6, -68.3));
            /* put */ (timeZoneGeographicPoints["BET"] = saoPaulo);
            /* put */ (timeZoneGeographicPoints["Eire"] = new Compass.GeographicPoint(53.333057, -6.248889));
            /* put */ (timeZoneGeographicPoints["GB"] = greenwich);
            /* put */ (timeZoneGeographicPoints["GB-Eire"] = new Compass.GeographicPoint(53.333057, -6.248889));
            /* put */ (timeZoneGeographicPoints["GMT"] = greenwich);
            /* put */ (timeZoneGeographicPoints["GMT0"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Greenwich"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Iceland"] = new Compass.GeographicPoint(64.1333, -21.9333));
            /* put */ (timeZoneGeographicPoints["Portugal"] = new Compass.GeographicPoint(38.716667, -9.133333));
            /* put */ (timeZoneGeographicPoints["UCT"] = greenwich);
            /* put */ (timeZoneGeographicPoints["UTC"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Universal"] = greenwich);
            /* put */ (timeZoneGeographicPoints["WET"] = greenwich);
            /* put */ (timeZoneGeographicPoints["Zulu"] = greenwich);
            /* put */ (timeZoneGeographicPoints["CET"] = paris);
            /* put */ (timeZoneGeographicPoints["ECT"] = paris);
            /* put */ (timeZoneGeographicPoints["MET"] = new Compass.GeographicPoint(35.671944, 51.424446));
            /* put */ (timeZoneGeographicPoints["Poland"] = new Compass.GeographicPoint(52.25, 21.0));
            /* put */ (timeZoneGeographicPoints["ART"] = new Compass.GeographicPoint(-34.5875, -58.6725));
            /* put */ (timeZoneGeographicPoints["CAT"] = new Compass.GeographicPoint(-1.9536111, 30.060556));
            /* put */ (timeZoneGeographicPoints["EET"] = new Compass.GeographicPoint(37.983334, 23.733334));
            /* put */ (timeZoneGeographicPoints["Egypt"] = new Compass.GeographicPoint(30.05, 31.25));
            /* put */ (timeZoneGeographicPoints["Israel"] = new Compass.GeographicPoint(32.066666, 34.766666));
            /* put */ (timeZoneGeographicPoints["Libya"] = new Compass.GeographicPoint(32.8925, 13.18));
            /* put */ (timeZoneGeographicPoints["Turkey"] = new Compass.GeographicPoint(41.018612, 28.964722));
            /* put */ (timeZoneGeographicPoints["EAT"] = new Compass.GeographicPoint(-1.2833333, 36.816666));
            /* put */ (timeZoneGeographicPoints["W-SU"] = moscow);
            /* put */ (timeZoneGeographicPoints["Iran"] = new Compass.GeographicPoint(35.671944, 51.424446));
            /* put */ (timeZoneGeographicPoints["NET"] = new Compass.GeographicPoint(40.18111, 44.51361));
            /* put */ (timeZoneGeographicPoints["PLT"] = new Compass.GeographicPoint(24.866667, 67.05));
            /* put */ (timeZoneGeographicPoints["IST"] = calcutta);
            /* put */ (timeZoneGeographicPoints["BST"] = dacca);
            /* put */ (timeZoneGeographicPoints["VST"] = bangkok);
            /* put */ (timeZoneGeographicPoints["CTT"] = shanghai);
            /* put */ (timeZoneGeographicPoints["Hongkong"] = new Compass.GeographicPoint(22.283333, 114.15));
            /* put */ (timeZoneGeographicPoints["PRC"] = shanghai);
            /* put */ (timeZoneGeographicPoints["Singapore"] = new Compass.GeographicPoint(1.2930557, 103.855835));
            /* put */ (timeZoneGeographicPoints["JST"] = tokyo);
            /* put */ (timeZoneGeographicPoints["Japan"] = tokyo);
            /* put */ (timeZoneGeographicPoints["ROK"] = new Compass.GeographicPoint(37.566387, 126.999725));
            /* put */ (timeZoneGeographicPoints["ACT"] = new Compass.GeographicPoint(-35.283333, 149.21666));
            /* put */ (timeZoneGeographicPoints["AET"] = sydney);
            /* put */ (timeZoneGeographicPoints["SST"] = new Compass.GeographicPoint(-28.4667, 159.8167));
            /* put */ (timeZoneGeographicPoints["Kwajalein"] = new Compass.GeographicPoint(9.1939, 167.4597));
            /* put */ (timeZoneGeographicPoints["NST"] = auckland);
            /* put */ (timeZoneGeographicPoints["NZ"] = auckland);
            /* put */ (timeZoneGeographicPoints["NZ-CHAT"] = new Compass.GeographicPoint(-43.883, -176.517));
            Compass.timeZoneGeographicPointsReference = (timeZoneGeographicPoints);
        }
        else {
            timeZoneGeographicPoints = Compass.timeZoneGeographicPointsReference;
        }
        var point = (function (m, k) { return m[k] ? m[k] : null; })(timeZoneGeographicPoints, /* getID */ /* getDefault */ "UTC");
        if (point == null) {
            point = (function (m, k) { return m[k] ? m[k] : null; })(timeZoneGeographicPoints, "Etc/GMT");
        }
        this.latitude = (Math.fround ? ((function (x) { return x * Math.PI / 180; })(point.getLatitudeInDegrees())) : Math.fround(/* toRadians */ (function (x) { return x * Math.PI / 180; })(point.getLatitudeInDegrees())));
        this.longitude = (Math.fround ? ((function (x) { return x * Math.PI / 180; })(point.getLongitudeInDegrees())) : Math.fround(/* toRadians */ (function (x) { return x * Math.PI / 180; })(point.getLongitudeInDegrees())));
    };
    return Compass;
}(HomeObject));
Compass.timeZoneGeographicPointsReference = null;
Compass["__class"] = "Compass";
Compass["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "java.io.Serializable"];
(function (Compass) {
    /**
     * A geographic point used to store known points.
     */
    var GeographicPoint = (function () {
        function GeographicPoint(latitudeInDegrees, longitudeInDegrees) {
            this.latitudeInDegrees = 0;
            this.longitudeInDegrees = 0;
            this.latitudeInDegrees = latitudeInDegrees;
            this.longitudeInDegrees = longitudeInDegrees;
        }
        GeographicPoint.prototype.getLatitudeInDegrees = function () {
            return this.latitudeInDegrees;
        };
        GeographicPoint.prototype.getLongitudeInDegrees = function () {
            return this.longitudeInDegrees;
        };
        return GeographicPoint;
    }());
    Compass.GeographicPoint = GeographicPoint;
    GeographicPoint["__class"] = "Compass.GeographicPoint";
})(Compass || (Compass = {}));
/**
 * Creates a dimension line from (<code>xStart</code>,<code>yStart</code>)
 * to (<code>xEnd</code>, <code>yEnd</code>), with a given offset.
 * @param {number} xStart
 * @param {number} yStart
 * @param {number} xEnd
 * @param {number} yEnd
 * @param {number} offset
 * @class
 */
var DimensionLine = (function (_super) {
    __extends(DimensionLine, _super);
    function DimensionLine(xStart, yStart, xEnd, yEnd, offset) {
        var _this = _super.call(this) || this;
        /*private*/ _this.propertyChangeSupport = new PropertyChangeSupport(_this);
        _this.xStart = 0;
        _this.yStart = 0;
        _this.xEnd = 0;
        _this.yEnd = 0;
        _this.offset = 0;
        _this.lengthStyle = null;
        _this.level = null;
        _this.shapeCache = null;
        _this.xStart = xStart;
        _this.yStart = yStart;
        _this.xEnd = xEnd;
        _this.yEnd = yEnd;
        _this.offset = offset;
        return _this;
    }
    /**
     * Adds the property change <code>listener</code> in parameter to this dimension line.
     * @param {PropertyChangeListener} listener
     */
    DimensionLine.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this dimension line.
     * @param {PropertyChangeListener} listener
     */
    DimensionLine.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
    };
    /**
     * Returns the start point abscissa of this dimension line.
     * @return {number}
     */
    DimensionLine.prototype.getXStart = function () {
        return this.xStart;
    };
    /**
     * Sets the start point abscissa of this dimension line. Once this dimension line
     * is updated, listeners added to this dimension line will receive a change notification.
     * @param {number} xStart
     */
    DimensionLine.prototype.setXStart = function (xStart) {
        if (xStart !== this.xStart) {
            var oldXStart = this.xStart;
            this.xStart = xStart;
            this.shapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "X_START", oldXStart, xStart);
        }
    };
    /**
     * Returns the start point ordinate of this dimension line.
     * @return {number}
     */
    DimensionLine.prototype.getYStart = function () {
        return this.yStart;
    };
    /**
     * Sets the start point ordinate of this dimension line. Once this dimension line
     * is updated, listeners added to this dimension line will receive a change notification.
     * @param {number} yStart
     */
    DimensionLine.prototype.setYStart = function (yStart) {
        if (yStart !== this.yStart) {
            var oldYStart = this.yStart;
            this.yStart = yStart;
            this.shapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "Y_START", oldYStart, yStart);
        }
    };
    /**
     * Returns the end point abscissa of this dimension line.
     * @return {number}
     */
    DimensionLine.prototype.getXEnd = function () {
        return this.xEnd;
    };
    /**
     * Sets the end point abscissa of this dimension line. Once this dimension line
     * is updated, listeners added to this dimension line will receive a change notification.
     * @param {number} xEnd
     */
    DimensionLine.prototype.setXEnd = function (xEnd) {
        if (xEnd !== this.xEnd) {
            var oldXEnd = this.xEnd;
            this.xEnd = xEnd;
            this.shapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "X_END", oldXEnd, xEnd);
        }
    };
    /**
     * Returns the end point ordinate of this dimension line.
     * @return {number}
     */
    DimensionLine.prototype.getYEnd = function () {
        return this.yEnd;
    };
    /**
     * Sets the end point ordinate of this dimension line. Once this dimension line
     * is updated, listeners added to this dimension line will receive a change notification.
     * @param {number} yEnd
     */
    DimensionLine.prototype.setYEnd = function (yEnd) {
        if (yEnd !== this.yEnd) {
            var oldYEnd = this.yEnd;
            this.yEnd = yEnd;
            this.shapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "Y_END", oldYEnd, yEnd);
        }
    };
    /**
     * Returns the offset of this dimension line.
     * @return {number}
     */
    DimensionLine.prototype.getOffset = function () {
        return this.offset;
    };
    /**
     * Sets the offset of this dimension line.  Once this dimension line
     * is updated, listeners added to this dimension line will receive a change notification.
     * @param {number} offset
     */
    DimensionLine.prototype.setOffset = function (offset) {
        if (offset !== this.offset) {
            var oldOffset = this.offset;
            this.offset = offset;
            this.shapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "Y_END", oldOffset, offset);
        }
    };
    /**
     * Returns the length of this dimension line.
     * @return {number}
     */
    DimensionLine.prototype.getLength = function () {
        return (Math.fround ? (java.awt.geom.Point2D.distance(this.getXStart(), this.getYStart(), this.getXEnd(), this.getYEnd())) : Math.fround(java.awt.geom.Point2D.distance(this.getXStart(), this.getYStart(), this.getXEnd(), this.getYEnd())));
    };
    /**
     * Returns the text style used to display dimension line length.
     * @return {TextStyle}
     */
    DimensionLine.prototype.getLengthStyle = function () {
        return this.lengthStyle;
    };
    /**
     * Sets the text style used to display dimension line length.
     * Once this dimension line is updated, listeners added to it will receive a change notification.
     * @param {TextStyle} lengthStyle
     */
    DimensionLine.prototype.setLengthStyle = function (lengthStyle) {
        if (lengthStyle !== this.lengthStyle) {
            var oldLengthStyle = this.lengthStyle;
            this.lengthStyle = lengthStyle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LENGTH_STYLE", oldLengthStyle, lengthStyle);
        }
    };
    /**
     * Returns the level which this dimension line belongs to.
     * @since 3.4
     * @return {Level}
     */
    DimensionLine.prototype.getLevel = function () {
        return this.level;
    };
    /**
     * Sets the level of this dimension line. Once this dimension line is updated,
     * listeners added to this dimension line will receive a change notification.
     * @since 3.4
     * @param {Level} level
     */
    DimensionLine.prototype.setLevel = function (level) {
        if (level !== this.level) {
            var oldLevel = this.level;
            this.level = level;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LEVEL", oldLevel, level);
        }
    };
    /**
     * Returns <code>true</code> if this dimension line is at the given <code>level</code>
     * or at a level with the same elevation and a smaller elevation index.
     * @since 3.4
     * @param {Level} level
     * @return {boolean}
     */
    DimensionLine.prototype.isAtLevel = function (level) {
        return this.level === level || this.level != null && level != null && this.level.getElevation() === level.getElevation() && this.level.getElevationIndex() < level.getElevationIndex();
    };
    /**
     * Returns the points of the rectangle surrounding
     * this dimension line and its extension lines.
     * @return {Array} an array of the 4 (x,y) coordinates of the rectangle.
     */
    DimensionLine.prototype.getPoints = function () {
        var angle = Math.atan2(this.yEnd - this.yStart, this.xEnd - this.xStart);
        var dx = (Math.fround ? (-Math.sin(angle)) : Math.fround(-Math.sin(angle))) * this.offset;
        var dy = (Math.fround ? (Math.cos(angle)) : Math.fround(Math.cos(angle))) * this.offset;
        return [[this.xStart, this.yStart], [this.xStart + dx, this.yStart + dy], [this.xEnd + dx, this.yEnd + dy], [this.xEnd, this.yEnd]];
    };
    /**
     * Returns <code>true</code> if this dimension line intersects
     * with the horizontal rectangle which opposite corners are at points
     * (<code>x0</code>, <code>y0</code>) and (<code>x1</code>, <code>y1</code>).
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {boolean}
     */
    DimensionLine.prototype.intersectsRectangle = function (x0, y0, x1, y1) {
        var rectangle = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
        rectangle.add(x1, y1);
        return this.getShape().intersects(rectangle);
    };
    /**
     * Returns <code>true</code> if this dimension line contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    DimensionLine.prototype.containsPoint = function (x, y, margin) {
        return this.containsShapeAtWithMargin(this.getShape(), x, y, margin);
    };
    /**
     * Returns <code>true</code> if the middle point of this dimension line
     * is the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    DimensionLine.prototype.isMiddlePointAt = function (x, y, margin) {
        var angle = Math.atan2(this.yEnd - this.yStart, this.xEnd - this.xStart);
        var dx = (Math.fround ? (-Math.sin(angle)) : Math.fround(-Math.sin(angle))) * this.offset;
        var dy = (Math.fround ? (Math.cos(angle)) : Math.fround(Math.cos(angle))) * this.offset;
        var xMiddle = (this.xStart + this.xEnd) / 2 + dx;
        var yMiddle = (this.yStart + this.yEnd) / 2 + dy;
        return Math.abs(x - xMiddle) <= margin && Math.abs(y - yMiddle) <= margin;
    };
    /**
     * Returns <code>true</code> if the extension line at the start of this dimension line
     * contains the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code> around the extension line.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    DimensionLine.prototype.containsStartExtensionLinetAt = function (x, y, margin) {
        var angle = Math.atan2(this.yEnd - this.yStart, this.xEnd - this.xStart);
        var startExtensionLine = new java.awt.geom.Line2D.Float(this.xStart, this.yStart, this.xStart + (Math.fround ? (-Math.sin(angle)) : Math.fround(-Math.sin(angle))) * this.offset, this.yStart + (Math.fround ? (Math.cos(angle)) : Math.fround(Math.cos(angle))) * this.offset);
        return this.containsShapeAtWithMargin(startExtensionLine, x, y, margin);
    };
    /**
     * Returns <code>true</code> if the extension line at the end of this dimension line
     * contains the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code> around the extension line.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    DimensionLine.prototype.containsEndExtensionLineAt = function (x, y, margin) {
        var angle = Math.atan2(this.yEnd - this.yStart, this.xEnd - this.xStart);
        var endExtensionLine = new java.awt.geom.Line2D.Float(this.xEnd, this.yEnd, this.xEnd + (Math.fround ? (-Math.sin(angle)) : Math.fround(-Math.sin(angle))) * this.offset, this.yEnd + (Math.fround ? (Math.cos(angle)) : Math.fround(Math.cos(angle))) * this.offset);
        return this.containsShapeAtWithMargin(endExtensionLine, x, y, margin);
    };
    /**
     * Returns <code>true</code> if <code>shape</code> contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {java.awt.Shape} shape
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     * @private
     */
    DimensionLine.prototype.containsShapeAtWithMargin = function (shape, x, y, margin) {
        if (margin === 0) {
            return shape.contains(x, y);
        }
        else {
            return shape.intersects(x - margin, y - margin, 2 * margin, 2 * margin);
        }
    };
    /**
     * Returns the shape matching this dimension line.
     * @return {java.awt.Shape}
     * @private
     */
    DimensionLine.prototype.getShape = function () {
        if (this.shapeCache == null) {
            var angle = Math.atan2(this.yEnd - this.yStart, this.xEnd - this.xStart);
            var dx = (Math.fround ? (-Math.sin(angle)) : Math.fround(-Math.sin(angle))) * this.offset;
            var dy = (Math.fround ? (Math.cos(angle)) : Math.fround(Math.cos(angle))) * this.offset;
            var dimensionLineShape = new java.awt.geom.GeneralPath();
            dimensionLineShape.append(new java.awt.geom.Line2D.Float(this.xStart + dx, this.yStart + dy, this.xEnd + dx, this.yEnd + dy), false);
            dimensionLineShape.append(new java.awt.geom.Line2D.Float(this.xStart, this.yStart, this.xStart + dx, this.yStart + dy), false);
            dimensionLineShape.append(new java.awt.geom.Line2D.Float(this.xEnd, this.yEnd, this.xEnd + dx, this.yEnd + dy), false);
            this.shapeCache = dimensionLineShape;
        }
        return this.shapeCache;
    };
    /**
     * Moves this dimension line of (<code>dx</code>, <code>dy</code>) units.
     * @param {number} dx
     * @param {number} dy
     */
    DimensionLine.prototype.move = function (dx, dy) {
        this.setXStart(this.getXStart() + dx);
        this.setYStart(this.getYStart() + dy);
        this.setXEnd(this.getXEnd() + dx);
        this.setYEnd(this.getYEnd() + dy);
    };
    /**
     * Returns a clone of this dimension line.
     * @return {DimensionLine}
     */
    DimensionLine.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_4 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_4[p] = o[p];
            }
            return clone_4;
        } })(this);
        clone.propertyChangeSupport = new PropertyChangeSupport(clone);
        clone.level = null;
        return clone;
    };
    return DimensionLine;
}(HomeObject));
DimensionLine["__class"] = "DimensionLine";
DimensionLine["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "com.eteks.sweethome3d.model.Elevatable", "java.io.Serializable"];
/**
 * A free label.
 * @author Emmanuel Puybaret
 * @extends HomeObject
 */
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(text, x, y) {
        var _this = _super.call(this) || this;
        /*private*/ _this.propertyChangeSupport = new PropertyChangeSupport(_this);
        _this.text = null;
        _this.x = 0;
        _this.y = 0;
        _this.style = null;
        _this.color = null;
        _this.outlineColor = null;
        _this.angle = 0;
        _this.pitch = null;
        _this.elevation = 0;
        _this.level = null;
        _this.text = text;
        _this.x = x;
        _this.y = y;
        return _this;
    }
    Label.TWICE_PI_$LI$ = function () { if (Label.TWICE_PI == null)
        Label.TWICE_PI = 2 * Math.PI; return Label.TWICE_PI; };
    ;
    /**
     * Adds the property change <code>listener</code> in parameter to this label.
     * @param {PropertyChangeListener} listener
     */
    Label.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this label.
     * @param {PropertyChangeListener} listener
     */
    Label.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
    };
    /**
     * Returns the text of this label.
     * @return {string}
     */
    Label.prototype.getText = function () {
        return this.text;
    };
    /**
     * Sets the text of this label. Once this label is updated,
     * listeners added to this label will receive a change notification.
     * @param {string} text
     */
    Label.prototype.setText = function (text) {
        if (text !== this.text && (text == null || !(text === this.text))) {
            var oldText = this.text;
            this.text = text;
            this.propertyChangeSupport.firePropertyChange(/* name */ "TEXT", oldText, text);
        }
    };
    /**
     * Returns the abscissa of the text of this label.
     * @return {number}
     */
    Label.prototype.getX = function () {
        return this.x;
    };
    /**
     * Sets the abscissa of the text of this label. Once this label is updated,
     * listeners added to this label will receive a change notification.
     * @param {number} x
     */
    Label.prototype.setX = function (x) {
        if (x !== this.x) {
            var oldX = this.x;
            this.x = x;
            this.propertyChangeSupport.firePropertyChange(/* name */ "X", oldX, x);
        }
    };
    /**
     * Returns the ordinate of the text of this label.
     * @return {number}
     */
    Label.prototype.getY = function () {
        return this.y;
    };
    /**
     * Sets the ordinate of the text of this label. Once this label is updated,
     * listeners added to this label will receive a change notification.
     * @param {number} y
     */
    Label.prototype.setY = function (y) {
        if (y !== this.y) {
            var oldY = this.y;
            this.y = y;
            this.propertyChangeSupport.firePropertyChange(/* name */ "Y", oldY, y);
        }
    };
    /**
     * Returns the elevation of this label
     * from the ground according to the elevation of its level.
     * @since 5.0
     * @return {number}
     */
    Label.prototype.getGroundElevation = function () {
        if (this.level != null) {
            return this.elevation + this.level.getElevation();
        }
        else {
            return this.elevation;
        }
    };
    /**
     * Returns the elevation of this label on its level.
     * @see #getPitch()
     * @since 5.0
     * @return {number}
     */
    Label.prototype.getElevation = function () {
        return this.elevation;
    };
    /**
     * Sets the elevation of this label on its level. Once this label is updated,
     * listeners added to this label will receive a change notification.
     * @since 5.0
     * @param {number} elevation
     */
    Label.prototype.setElevation = function (elevation) {
        if (elevation !== this.elevation) {
            var oldElevation = this.elevation;
            this.elevation = elevation;
            this.propertyChangeSupport.firePropertyChange(/* name */ "ELEVATION", oldElevation, elevation);
        }
    };
    /**
     * Returns the style used to display the text of this label.
     * @return {TextStyle}
     */
    Label.prototype.getStyle = function () {
        return this.style;
    };
    /**
     * Sets the style used to display the text of this label.
     * Once this label is updated, listeners added to this label will receive a change notification.
     * @param {TextStyle} style
     */
    Label.prototype.setStyle = function (style) {
        if (style !== this.style) {
            var oldStyle = this.style;
            this.style = style;
            this.propertyChangeSupport.firePropertyChange(/* name */ "STYLE", oldStyle, style);
        }
    };
    /**
     * Returns the color used to display the text of this label.
     * @since 5.0
     * @return {number}
     */
    Label.prototype.getColor = function () {
        return this.color;
    };
    /**
     * Sets the color used to display the text of this label.
     * Once this label is updated, listeners added to this label will receive a change notification.
     * @since 5.0
     * @param {number} color
     */
    Label.prototype.setColor = function (color) {
        if (color !== this.color) {
            var oldColor = this.color;
            this.color = color;
            this.propertyChangeSupport.firePropertyChange(/* name */ "COLOR", oldColor, color);
        }
    };
    /**
     * Returns the color used to outline the text of this label.
     * @since 5.3
     * @return {number}
     */
    Label.prototype.getOutlineColor = function () {
        return this.outlineColor;
    };
    /**
     * Sets the color used to outline the text of this label.
     * Once this label is updated, listeners added to this label will receive a change notification.
     * @since 5.3
     * @param {number} outlineColor
     */
    Label.prototype.setOutlineColor = function (outlineColor) {
        if (outlineColor !== this.outlineColor) {
            var oldOutlineColor = this.outlineColor;
            this.outlineColor = outlineColor;
            this.propertyChangeSupport.firePropertyChange(/* name */ "OUTLINE_COLOR", oldOutlineColor, outlineColor);
        }
    };
    /**
     * Returns the angle in radians around vertical axis used to display this label.
     * @since 3.6
     * @return {number}
     */
    Label.prototype.getAngle = function () {
        return this.angle;
    };
    /**
     * Sets the angle in radians around vertical axis used to display this label. Once this label is updated,
     * listeners added to this label will receive a change notification.
     * @since 3.6
     * @param {number} angle
     */
    Label.prototype.setAngle = function (angle) {
        angle = (Math.fround ? (((angle % Label.TWICE_PI_$LI$() + Label.TWICE_PI_$LI$()) % Label.TWICE_PI_$LI$())) : Math.fround(((angle % Label.TWICE_PI_$LI$() + Label.TWICE_PI_$LI$()) % Label.TWICE_PI_$LI$())));
        if (angle !== this.angle) {
            var oldAngle = this.angle;
            this.angle = angle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "ANGLE", oldAngle, angle);
        }
    };
    /**
     * Returns the pitch angle in radians used to rotate this label around horizontal axis in 3D.
     * @return {number} an angle in radians or <code>null</code> if the label shouldn't be displayed in 3D.
     * A pitch angle equal to 0 should make this label fully visible when seen from top.
     * @since 5.0
     */
    Label.prototype.getPitch = function () {
        return this.pitch;
    };
    /**
     * Sets the angle in radians used to rotate this label around horizontal axis in 3D. Once this label is updated,
     * listeners added to this label will receive a change notification.
     * @since 5.0
     * @param {number} pitch
     */
    Label.prototype.setPitch = function (pitch) {
        if (pitch != null) {
            pitch = (Math.fround ? (((pitch % Label.TWICE_PI_$LI$() + Label.TWICE_PI_$LI$()) % Label.TWICE_PI_$LI$())) : Math.fround(((pitch % Label.TWICE_PI_$LI$() + Label.TWICE_PI_$LI$()) % Label.TWICE_PI_$LI$())));
        }
        if (pitch !== this.pitch && (pitch == null || !(pitch === this.pitch))) {
            var oldPitch = this.pitch;
            this.pitch = pitch;
            this.propertyChangeSupport.firePropertyChange(/* name */ "PITCH", oldPitch, pitch);
        }
    };
    /**
     * Returns the level which this label belongs to.
     * @since 3.4
     * @return {Level}
     */
    Label.prototype.getLevel = function () {
        return this.level;
    };
    /**
     * Sets the level of this label. Once this label is updated,
     * listeners added to this label will receive a change notification.
     * @since 3.4
     * @param {Level} level
     */
    Label.prototype.setLevel = function (level) {
        if (level !== this.level) {
            var oldLevel = this.level;
            this.level = level;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LEVEL", oldLevel, level);
        }
    };
    /**
     * Returns <code>true</code> if this label is at the given <code>level</code>
     * or at a level with the same elevation and a smaller elevation index.
     * @since 3.4
     * @param {Level} level
     * @return {boolean}
     */
    Label.prototype.isAtLevel = function (level) {
        return this.level === level || this.level != null && level != null && this.level.getElevation() === level.getElevation() && this.level.getElevationIndex() < level.getElevationIndex();
    };
    /**
     * Returns the point of this label.
     * @return {Array} an array of the (x,y) coordinates of this label.
     */
    Label.prototype.getPoints = function () {
        return [[this.x, this.y]];
    };
    /**
     * Returns <code>true</code> if the point of this label is contained
     * in the horizontal rectangle which opposite corners are at points
     * (<code>x0</code>, <code>y0</code>) and (<code>x1</code>, <code>y1</code>).
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {boolean}
     */
    Label.prototype.intersectsRectangle = function (x0, y0, x1, y1) {
        var rectangle = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
        rectangle.add(x1, y1);
        return rectangle.contains(this.x, this.y);
    };
    /**
     * Returns <code>true</code> if this text is at the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    Label.prototype.containsPoint = function (x, y, margin) {
        return Math.abs(x - this.x) <= margin && Math.abs(y - this.y) <= margin;
    };
    /**
     * Moves this label of (<code>dx</code>, <code>dy</code>) units.
     * @param {number} dx
     * @param {number} dy
     */
    Label.prototype.move = function (dx, dy) {
        this.setX(this.getX() + dx);
        this.setY(this.getY() + dy);
    };
    /**
     * Returns a clone of this label.
     * @return {Label}
     */
    Label.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_5 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_5[p] = o[p];
            }
            return clone_5;
        } })(this);
        clone.propertyChangeSupport = new PropertyChangeSupport(clone);
        clone.level = null;
        return clone;
    };
    return Label;
}(HomeObject));
Label["__class"] = "Label";
Label["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "com.eteks.sweethome3d.model.Elevatable", "java.io.Serializable"];
/**
 * Creates a home level from an existing level.
 * @param {string} name  the name of the level
 * @param {number} elevation the elevation of the bottom of the level
 * @param {number} floorThickness the floor thickness of the level
 * @param {number} height the height of the level
 * @class
 */
var Level = (function (_super) {
    __extends(Level, _super);
    function Level(name, elevation, floorThickness, height) {
        var _this = _super.call(this) || this;
        /*private*/ _this.propertyChangeSupport = new PropertyChangeSupport(_this);
        _this.name = null;
        _this.elevation = 0;
        _this.floorThickness = 0;
        _this.height = 0;
        _this.backgroundImage = null;
        _this.visible = false;
        _this.viewable = false;
        _this.elevationIndex = 0;
        _this.name = name;
        _this.elevation = elevation;
        _this.floorThickness = floorThickness;
        _this.height = height;
        _this.visible = true;
        _this.viewable = true;
        _this.elevationIndex = -1;
        return _this;
    }
    /**
     * Adds the property change <code>listener</code> in parameter to this level.
     * @param {PropertyChangeListener} listener
     */
    Level.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this level.
     * @param {PropertyChangeListener} listener
     */
    Level.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
    };
    /**
     * Returns the name of this level.
     * @return {string}
     */
    Level.prototype.getName = function () {
        return this.name;
    };
    /**
     * Sets the name of this level. Once this level
     * is updated, listeners added to this level will receive a change notification.
     * @param {string} name
     */
    Level.prototype.setName = function (name) {
        if (name !== this.name && (name == null || !(name === this.name))) {
            var oldName = this.name;
            this.name = name;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME", oldName, name);
        }
    };
    /**
     * Returns the elevation of the bottom of this level.
     * @return {number}
     */
    Level.prototype.getElevation = function () {
        return this.elevation;
    };
    /**
     * Sets the elevation of this level. Once this level is updated,
     * listeners added to this level will receive a change notification.
     * @param {number} elevation
     */
    Level.prototype.setElevation = function (elevation) {
        if (elevation !== this.elevation) {
            var oldElevation = this.elevation;
            this.elevation = elevation;
            this.propertyChangeSupport.firePropertyChange(/* name */ "ELEVATION", oldElevation, elevation);
        }
    };
    /**
     * Returns the floor thickness of this level.
     * @return {number}
     */
    Level.prototype.getFloorThickness = function () {
        return this.floorThickness;
    };
    /**
     * Sets the floor thickness of this level. Once this level is updated,
     * listeners added to this level will receive a change notification.
     * @param {number} floorThickness
     */
    Level.prototype.setFloorThickness = function (floorThickness) {
        if (floorThickness !== this.floorThickness) {
            var oldFloorThickness = this.floorThickness;
            this.floorThickness = floorThickness;
            this.propertyChangeSupport.firePropertyChange(/* name */ "FLOOR_THICKNESS", oldFloorThickness, floorThickness);
        }
    };
    /**
     * Returns the height of this level.
     * @return {number}
     */
    Level.prototype.getHeight = function () {
        return this.height;
    };
    /**
     * Sets the height of this level. Once this level is updated,
     * listeners added to this level will receive a change notification.
     * @param {number} height
     */
    Level.prototype.setHeight = function (height) {
        if (height !== this.height) {
            var oldHeight = this.height;
            this.height = height;
            this.propertyChangeSupport.firePropertyChange(/* name */ "HEIGHT", oldHeight, height);
        }
    };
    /**
     * Returns the plan background image of this level.
     * @return {BackgroundImage}
     */
    Level.prototype.getBackgroundImage = function () {
        return this.backgroundImage;
    };
    /**
     * Sets the plan background image of this level and fires a <code>PropertyChangeEvent</code>.
     * @param {BackgroundImage} backgroundImage
     */
    Level.prototype.setBackgroundImage = function (backgroundImage) {
        if (backgroundImage !== this.backgroundImage) {
            var oldBackgroundImage = this.backgroundImage;
            this.backgroundImage = backgroundImage;
            this.propertyChangeSupport.firePropertyChange(/* name */ "BACKGROUND_IMAGE", oldBackgroundImage, backgroundImage);
        }
    };
    /**
     * Returns <code>true</code> if this level is visible.
     * @return {boolean}
     */
    Level.prototype.isVisible = function () {
        return this.visible;
    };
    /**
     * Sets whether this level is visible or not. Once this level is updated,
     * listeners added to this level will receive a change notification.
     * @param {boolean} visible
     */
    Level.prototype.setVisible = function (visible) {
        if (visible !== this.visible) {
            this.visible = visible;
            this.propertyChangeSupport.firePropertyChange(/* name */ "VISIBLE", !visible, visible);
        }
    };
    /**
     * Returns <code>true</code> if this level is viewable.
     * @since 5.0
     * @return {boolean}
     */
    Level.prototype.isViewable = function () {
        return this.viewable;
    };
    /**
     * Sets whether this level is viewable or not. Once this level is updated,
     * listeners added to this level will receive a change notification.
     * @since 5.0
     * @param {boolean} viewable
     */
    Level.prototype.setViewable = function (viewable) {
        if (viewable !== this.viewable) {
            this.viewable = viewable;
            this.propertyChangeSupport.firePropertyChange(/* name */ "VIEWABLE", !viewable, viewable);
        }
    };
    /**
     * Returns <code>true</code> if this level is viewable and visible.
     * @since 5.0
     * @return {boolean}
     */
    Level.prototype.isViewableAndVisible = function () {
        return this.viewable && this.visible;
    };
    /**
     * Returns the index of this level used to order levels at the same elevation.
     * @since 5.0
     * @return {number}
     */
    Level.prototype.getElevationIndex = function () {
        return this.elevationIndex;
    };
    /**
     * Sets the index of this level used to order levels at the same elevation.
     * @since 5.0
     * @param {number} elevationIndex
     */
    Level.prototype.setElevationIndex = function (elevationIndex) {
        if (elevationIndex !== this.elevationIndex) {
            var oldElevationIndex = this.elevationIndex;
            this.elevationIndex = elevationIndex;
            this.propertyChangeSupport.firePropertyChange(/* name */ "ELEVATION_INDEX", oldElevationIndex, elevationIndex);
        }
    };
    /**
     * Returns a clone of this level.
     * @return {Level}
     */
    Level.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_6 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_6[p] = o[p];
            }
            return clone_6;
        } })(this);
        clone.propertyChangeSupport = new PropertyChangeSupport(clone);
        return clone;
    };
    return Level;
}(HomeObject));
Level["__class"] = "Level";
Level["__interfaces"] = ["java.lang.Cloneable", "java.io.Serializable"];
/**
 * Creates a polyline from the given coordinates.
 * @param {Array} points
 * @param {number} thickness
 * @param {Polyline.CapStyle} capStyle
 * @param {Polyline.JoinStyle} joinStyle
 * @param {Polyline.DashStyle} dashStyle
 * @param {Polyline.ArrowStyle} startArrowStyle
 * @param {Polyline.ArrowStyle} endArrowStyle
 * @param {boolean} closedPath
 * @param {number} color
 * @class
 */
var Polyline = (function (_super) {
    __extends(Polyline, _super);
    function Polyline(points, thickness, capStyle, joinStyle, dashStyle, startArrowStyle, endArrowStyle, closedPath, color) {
        var _this = this;
        if (((points != null && points instanceof Array && (points.length == 0 || points[0] == null || points[0] instanceof Array)) || points === null) && ((typeof thickness === 'number') || thickness === null) && ((typeof capStyle === 'number') || capStyle === null) && ((typeof joinStyle === 'number') || joinStyle === null) && ((typeof dashStyle === 'number') || dashStyle === null) && ((typeof startArrowStyle === 'number') || startArrowStyle === null) && ((typeof endArrowStyle === 'number') || endArrowStyle === null) && ((typeof closedPath === 'boolean') || closedPath === null) && ((typeof color === 'number') || color === null)) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this) || this;
            _this.points = null;
            _this.thickness = 0;
            _this.capStyle = null;
            _this.capStyleName = null;
            _this.joinStyle = null;
            _this.joinStyleName = null;
            _this.dashStyle = null;
            _this.dashStyleName = null;
            _this.startArrowStyle = null;
            _this.startArrowStyleName = null;
            _this.endArrowStyle = null;
            _this.endArrowStyleName = null;
            _this.closedPath = false;
            _this.color = 0;
            _this.level = null;
            _this.polylinePathCache = null;
            _this.shapeCache = null;
            _this.propertyChangeSupport = new PropertyChangeSupport(_this);
            _this.points = null;
            _this.thickness = 0;
            _this.capStyle = null;
            _this.capStyleName = null;
            _this.joinStyle = null;
            _this.joinStyleName = null;
            _this.dashStyle = null;
            _this.dashStyleName = null;
            _this.startArrowStyle = null;
            _this.startArrowStyleName = null;
            _this.endArrowStyle = null;
            _this.endArrowStyleName = null;
            _this.closedPath = false;
            _this.color = 0;
            _this.level = null;
            _this.polylinePathCache = null;
            _this.shapeCache = null;
            (function () {
                _this.points = _this.deepCopy(points);
                _this.thickness = thickness;
                _this.capStyle = capStyle;
                _this.joinStyle = joinStyle;
                _this.dashStyle = dashStyle;
                _this.startArrowStyle = startArrowStyle;
                _this.endArrowStyle = endArrowStyle;
                _this.closedPath = closedPath;
                _this.color = color;
            })();
        }
        else if (((points != null && points instanceof Array && (points.length == 0 || points[0] == null || points[0] instanceof Array)) || points === null) && thickness === undefined && capStyle === undefined && joinStyle === undefined && dashStyle === undefined && startArrowStyle === undefined && endArrowStyle === undefined && closedPath === undefined && color === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_26 = Array.prototype.slice.call(arguments);
                var thickness_2 = 1;
                var capStyle_1 = Polyline.CapStyle.BUTT;
                var joinStyle_1 = Polyline.JoinStyle.MITER;
                var dashStyle_1 = Polyline.DashStyle.SOLID;
                var startArrowStyle_1 = Polyline.ArrowStyle.NONE;
                var endArrowStyle_1 = Polyline.ArrowStyle.NONE;
                var closedPath_1 = false;
                var color_4 = -16777216;
                _this = _super.call(this) || this;
                _this.points = null;
                _this.thickness = 0;
                _this.capStyle = null;
                _this.capStyleName = null;
                _this.joinStyle = null;
                _this.joinStyleName = null;
                _this.dashStyle = null;
                _this.dashStyleName = null;
                _this.startArrowStyle = null;
                _this.startArrowStyleName = null;
                _this.endArrowStyle = null;
                _this.endArrowStyleName = null;
                _this.closedPath = false;
                _this.color = 0;
                _this.level = null;
                _this.polylinePathCache = null;
                _this.shapeCache = null;
                _this.propertyChangeSupport = new PropertyChangeSupport(_this);
                _this.points = null;
                _this.thickness = 0;
                _this.capStyle = null;
                _this.capStyleName = null;
                _this.joinStyle = null;
                _this.joinStyleName = null;
                _this.dashStyle = null;
                _this.dashStyleName = null;
                _this.startArrowStyle = null;
                _this.startArrowStyleName = null;
                _this.endArrowStyle = null;
                _this.endArrowStyleName = null;
                _this.closedPath = false;
                _this.color = 0;
                _this.level = null;
                _this.polylinePathCache = null;
                _this.shapeCache = null;
                (function () {
                    _this.points = _this.deepCopy(points);
                    _this.thickness = thickness_2;
                    _this.capStyle = capStyle_1;
                    _this.joinStyle = joinStyle_1;
                    _this.dashStyle = dashStyle_1;
                    _this.startArrowStyle = startArrowStyle_1;
                    _this.endArrowStyle = endArrowStyle_1;
                    _this.closedPath = closedPath_1;
                    _this.color = color_4;
                })();
            }
        }
        else
            throw new Error('invalid overload');
        return _this;
    }
    /**
     * Adds the property change <code>listener</code> in parameter to this wall.
     * @param {PropertyChangeListener} listener
     */
    Polyline.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this wall.
     * @param {PropertyChangeListener} listener
     */
    Polyline.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
    };
    /**
     * Returns the points of the polygon matching this polyline.
     * @return {Array} an array of the (x,y) coordinates of the polyline points.
     */
    Polyline.prototype.getPoints = function () {
        return this.deepCopy(this.points);
    };
    /**
     * Returns the number of points of the polygon matching this polyline.
     * @return {number}
     */
    Polyline.prototype.getPointCount = function () {
        return this.points.length;
    };
    Polyline.prototype.deepCopy = function (points) {
        var pointsCopy = new Array(points.length);
        for (var i = 0; i < points.length; i++) {
            pointsCopy[i] = points[i].slice(0);
        }
        return pointsCopy;
    };
    /**
     * Sets the points of the polygon matching this polyline. Once this polyline
     * is updated, listeners added to this polyline will receive a change notification.
     * @param {Array} points
     */
    Polyline.prototype.setPoints = function (points) {
        if (!(JSON.stringify(this.points) === JSON.stringify(points))) {
            this.updatePoints(points);
        }
    };
    /**
     * Update the points of the polygon matching this polyline.
     * @param {Array} points
     * @private
     */
    Polyline.prototype.updatePoints = function (points) {
        var oldPoints = this.points;
        this.points = this.deepCopy(points);
        this.polylinePathCache = null;
        this.shapeCache = null;
        this.propertyChangeSupport.firePropertyChange(/* name */ "POINTS", oldPoints, points);
    };
    /**
     * Adds a point at the end of polyline points.
     * @param {number} x
     * @param {number} y
     */
    Polyline.prototype.addPoint$float$float = function (x, y) {
        this.addPoint$float$float$int(x, y, this.points.length);
    };
    /**
     * Adds a point at the given <code>index</code>.
     * @throws IndexOutOfBoundsException if <code>index</code> is negative or > <code>getPointCount()</code>
     * @param {number} x
     * @param {number} y
     * @param {number} index
     */
    Polyline.prototype.addPoint$float$float$int = function (x, y, index) {
        if (index < 0 || index > this.points.length) {
            throw Object.defineProperty(new Error("Invalid index " + index), '__class', { configurable: true, value: 'java.lang.IndexOutOfBoundsException' });
        }
        var newPoints = new Array(this.points.length + 1);
        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
            while (--size >= 0)
                dstPts[dstOff++] = srcPts[srcOff++];
        }
        else {
            var tmp = srcPts.slice(srcOff, srcOff + size);
            for (var i = 0; i < size; i++)
                dstPts[dstOff++] = tmp[i];
        } })(this.points, 0, newPoints, 0, index);
        newPoints[index] = [x, y];
        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
            while (--size >= 0)
                dstPts[dstOff++] = srcPts[srcOff++];
        }
        else {
            var tmp = srcPts.slice(srcOff, srcOff + size);
            for (var i = 0; i < size; i++)
                dstPts[dstOff++] = tmp[i];
        } })(this.points, index, newPoints, index + 1, this.points.length - index);
        var oldPoints = this.points;
        this.points = newPoints;
        this.polylinePathCache = null;
        this.shapeCache = null;
        this.propertyChangeSupport.firePropertyChange(/* name */ "POINTS", oldPoints, this.deepCopy(this.points));
    };
    /**
     * Adds a point at the given <code>index</code>.
     * @throws IndexOutOfBoundsException if <code>index</code> is negative or > <code>getPointCount()</code>
     * @param {number} x
     * @param {number} y
     * @param {number} index
     */
    Polyline.prototype.addPoint = function (x, y, index) {
        if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof index === 'number') || index === null)) {
            return this.addPoint$float$float$int(x, y, index);
        }
        else if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && index === undefined) {
            return this.addPoint$float$float(x, y);
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Sets the point at the given <code>index</code>.
     * @throws IndexOutOfBoundsException if <code>index</code> is negative or >= <code>getPointCount()</code>
     * @param {number} x
     * @param {number} y
     * @param {number} index
     */
    Polyline.prototype.setPoint = function (x, y, index) {
        if (index < 0 || index >= this.points.length) {
            throw Object.defineProperty(new Error("Invalid index " + index), '__class', { configurable: true, value: 'java.lang.IndexOutOfBoundsException' });
        }
        if (this.points[index][0] !== x || this.points[index][1] !== y) {
            var oldPoints = this.points;
            this.points = this.deepCopy(this.points);
            this.points[index][0] = x;
            this.points[index][1] = y;
            this.polylinePathCache = null;
            this.shapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "POINTS", oldPoints, this.deepCopy(this.points));
        }
    };
    /**
     * Removes the point at the given <code>index</code>.
     * @throws IndexOutOfBoundsException if <code>index</code> is negative or >= <code>getPointCount()</code>
     * @param {number} index
     */
    Polyline.prototype.removePoint = function (index) {
        if (index < 0 || index >= this.points.length) {
            throw Object.defineProperty(new Error("Invalid index " + index), '__class', { configurable: true, value: 'java.lang.IndexOutOfBoundsException' });
        }
        var newPoints = new Array(this.points.length - 1);
        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
            while (--size >= 0)
                dstPts[dstOff++] = srcPts[srcOff++];
        }
        else {
            var tmp = srcPts.slice(srcOff, srcOff + size);
            for (var i = 0; i < size; i++)
                dstPts[dstOff++] = tmp[i];
        } })(this.points, 0, newPoints, 0, index);
        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
            while (--size >= 0)
                dstPts[dstOff++] = srcPts[srcOff++];
        }
        else {
            var tmp = srcPts.slice(srcOff, srcOff + size);
            for (var i = 0; i < size; i++)
                dstPts[dstOff++] = tmp[i];
        } })(this.points, index + 1, newPoints, index, this.points.length - index - 1);
        var oldPoints = this.points;
        this.points = newPoints;
        this.polylinePathCache = null;
        this.shapeCache = null;
        this.propertyChangeSupport.firePropertyChange(/* name */ "POINTS", oldPoints, this.deepCopy(this.points));
    };
    /**
     * Returns the thickness of this polyline.
     * @return {number}
     */
    Polyline.prototype.getThickness = function () {
        return this.thickness;
    };
    /**
     * Sets the thickness of this polyline.
     * Once this polyline is updated, listeners added to this polyline will receive a change notification.
     * @param {number} thickness
     */
    Polyline.prototype.setThickness = function (thickness) {
        if (thickness !== this.thickness) {
            var oldThickness = this.thickness;
            this.thickness = thickness;
            this.propertyChangeSupport.firePropertyChange(/* name */ "THICKNESS", oldThickness, thickness);
        }
    };
    /**
     * Returns the cap style of this polyline.
     * @return {Polyline.CapStyle}
     */
    Polyline.prototype.getCapStyle = function () {
        return this.capStyle;
    };
    /**
     * Sets the cap style of this polyline.
     * Once this polyline is updated, listeners added to this polyline will receive a change notification.
     * @param {Polyline.CapStyle} capStyle
     */
    Polyline.prototype.setCapStyle = function (capStyle) {
        if (capStyle !== this.capStyle) {
            var oldStyle = this.capStyle;
            this.capStyle = capStyle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "CAP_STYLE", oldStyle, capStyle);
        }
    };
    /**
     * Returns the join style of this polyline.
     * @return {Polyline.JoinStyle}
     */
    Polyline.prototype.getJoinStyle = function () {
        return this.joinStyle;
    };
    /**
     * Sets the join style of this polyline.
     * Once this polyline is updated, listeners added to this polyline will receive a change notification.
     * @param {Polyline.JoinStyle} joinStyle
     */
    Polyline.prototype.setJoinStyle = function (joinStyle) {
        if (joinStyle !== this.joinStyle) {
            var oldJoinStyle = this.joinStyle;
            this.joinStyle = joinStyle;
            this.polylinePathCache = null;
            this.shapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "JOIN_STYLE", oldJoinStyle, joinStyle);
        }
    };
    /**
     * Returns the dash style of this polyline.
     * @return {Polyline.DashStyle}
     */
    Polyline.prototype.getDashStyle = function () {
        return this.dashStyle;
    };
    /**
     * Sets the dash style of this polyline.
     * Once this polyline is updated, listeners added to this polyline will receive a change notification.
     * @param {Polyline.DashStyle} dashStyle
     */
    Polyline.prototype.setDashStyle = function (dashStyle) {
        if (dashStyle !== this.dashStyle) {
            var oldDashStyle = this.dashStyle;
            this.dashStyle = dashStyle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "DASH_STYLE", oldDashStyle, dashStyle);
        }
    };
    /**
     * Returns the arrow style at the start of this polyline.
     * @return {Polyline.ArrowStyle}
     */
    Polyline.prototype.getStartArrowStyle = function () {
        return this.startArrowStyle;
    };
    /**
     * Sets the arrow style at the start of this polyline.
     * Once this polyline is updated, listeners added to this polyline will receive a change notification.
     * @param {Polyline.ArrowStyle} startArrowStyle
     */
    Polyline.prototype.setStartArrowStyle = function (startArrowStyle) {
        if (startArrowStyle !== this.startArrowStyle) {
            var oldStartArrowStyle = this.startArrowStyle;
            this.startArrowStyle = startArrowStyle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "START_ARROW_STYLE", oldStartArrowStyle, startArrowStyle);
        }
    };
    /**
     * Returns the arrow style at the end of this polyline.
     * @return {Polyline.ArrowStyle}
     */
    Polyline.prototype.getEndArrowStyle = function () {
        return this.endArrowStyle;
    };
    /**
     * Sets the arrow style at the end of this polyline.
     * Once this polyline is updated, listeners added to this polyline will receive a change notification.
     * @param {Polyline.ArrowStyle} endArrowStyle
     */
    Polyline.prototype.setEndArrowStyle = function (endArrowStyle) {
        if (endArrowStyle !== this.endArrowStyle) {
            var oldEndArrowStyle = this.endArrowStyle;
            this.endArrowStyle = endArrowStyle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "END_ARROW_STYLE", oldEndArrowStyle, endArrowStyle);
        }
    };
    /**
     * Returns <code>true</code> if the first and last points of this polyline should be joined to form a polygon.
     * @return {boolean}
     */
    Polyline.prototype.isClosedPath = function () {
        return this.closedPath;
    };
    /**
     * Sets whether the first and last points of this polyline should be joined.
     * Once this polyline is updated, listeners added to this polyline will receive a change notification.
     * @param {boolean} closedPath
     */
    Polyline.prototype.setClosedPath = function (closedPath) {
        if (closedPath !== this.closedPath) {
            this.closedPath = closedPath;
            this.propertyChangeSupport.firePropertyChange(/* name */ "CLOSED_PATH", !closedPath, closedPath);
        }
    };
    /**
     * Returns the color of this polyline.
     * @return {number}
     */
    Polyline.prototype.getColor = function () {
        return this.color;
    };
    /**
     * Sets the color of this polyline. Once this polyline is updated,
     * listeners added to this polyline will receive a change notification.
     * @param {number} color
     */
    Polyline.prototype.setColor = function (color) {
        if (color !== this.color) {
            var oldColor = this.color;
            this.color = color;
            this.propertyChangeSupport.firePropertyChange(/* name */ "COLOR", oldColor, color);
        }
    };
    /**
     * Returns the level which this dimension line belongs to.
     * @return {Level}
     */
    Polyline.prototype.getLevel = function () {
        return this.level;
    };
    /**
     * Sets the level of this dimension line. Once this dimension line is updated,
     * listeners added to this dimension line will receive a change notification.
     * @param {Level} level
     */
    Polyline.prototype.setLevel = function (level) {
        if (level !== this.level) {
            var oldLevel = this.level;
            this.level = level;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LEVEL", oldLevel, level);
        }
    };
    /**
     * Returns <code>true</code> if this dimension line is at the given <code>level</code>
     * or at a level with the same elevation and a smaller elevation index.
     * @param {Level} level
     * @return {boolean}
     */
    Polyline.prototype.isAtLevel = function (level) {
        return this.level === level || this.level != null && level != null && this.level.getElevation() === level.getElevation() && this.level.getElevationIndex() < level.getElevationIndex();
    };
    /**
     * Returns an approximate length of this polyline.
     * @return {number}
     */
    Polyline.prototype.getLength = function () {
        var firstPoint = [0, 0];
        var previousPoint = [0, 0];
        var point = [0, 0];
        var length = 0;
        for (var it = this.getPolylinePath().getPathIterator(null, 0.1); !it.isDone(); it.next()) {
            switch ((it.currentSegment(point))) {
                case java.awt.geom.PathIterator.SEG_CLOSE:
                    length += java.awt.geom.Point2D.distance(firstPoint[0], firstPoint[1], previousPoint[0], previousPoint[1]);
                    break;
                case java.awt.geom.PathIterator.SEG_MOVETO:
                    /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
                        while (--size >= 0)
                            dstPts[dstOff++] = srcPts[srcOff++];
                    }
                    else {
                        var tmp = srcPts.slice(srcOff, srcOff + size);
                        for (var i = 0; i < size; i++)
                            dstPts[dstOff++] = tmp[i];
                    } })(point, 0, firstPoint, 0, 2);
                    /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
                        while (--size >= 0)
                            dstPts[dstOff++] = srcPts[srcOff++];
                    }
                    else {
                        var tmp = srcPts.slice(srcOff, srcOff + size);
                        for (var i = 0; i < size; i++)
                            dstPts[dstOff++] = tmp[i];
                    } })(point, 0, previousPoint, 0, 2);
                    break;
                case java.awt.geom.PathIterator.SEG_LINETO:
                    length += java.awt.geom.Point2D.distance(previousPoint[0], previousPoint[1], point[0], point[1]);
                    /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
                        while (--size >= 0)
                            dstPts[dstOff++] = srcPts[srcOff++];
                    }
                    else {
                        var tmp = srcPts.slice(srcOff, srcOff + size);
                        for (var i = 0; i < size; i++)
                            dstPts[dstOff++] = tmp[i];
                    } })(point, 0, previousPoint, 0, 2);
                    break;
            }
        }
        return length;
    };
    /**
     * Returns <code>true</code> if this polyline intersects
     * with the horizontal rectangle which opposite corners are at points
     * (<code>x0</code>, <code>y0</code>) and (<code>x1</code>, <code>y1</code>).
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {boolean}
     */
    Polyline.prototype.intersectsRectangle = function (x0, y0, x1, y1) {
        var rectangle = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
        rectangle.add(x1, y1);
        return this.getShape().intersects(rectangle);
    };
    /**
     * Returns <code>true</code> if this polyline contains
     * the point at (<code>x</code>, <code>y</code>) with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    Polyline.prototype.containsPoint = function (x, y, margin) {
        return this.containsShapeAtWithMargin(this.getShape(), x, y, margin);
    };
    /**
     * Returns the index of the point of this polyline equal to
     * the point at (<code>x</code>, <code>y</code>) with a given <code>margin</code>.
     * @return {number} the index of the first found point or -1.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     */
    Polyline.prototype.getPointIndexAt = function (x, y, margin) {
        for (var i = 0; i < this.points.length; i++) {
            if (Math.abs(x - this.points[i][0]) <= margin && Math.abs(y - this.points[i][1]) <= margin) {
                return i;
            }
        }
        return -1;
    };
    /**
     * Returns <code>true</code> if <code>shape</code> contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {java.awt.Shape} shape
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     * @private
     */
    Polyline.prototype.containsShapeAtWithMargin = function (shape, x, y, margin) {
        if (margin === 0) {
            return shape.contains(x, y);
        }
        else {
            return shape.intersects(x - margin, y - margin, 2 * margin, 2 * margin);
        }
    };
    /**
     * Returns the path matching this polyline.
     * @return {java.awt.Shape}
     * @private
     */
    Polyline.prototype.getPolylinePath = function () {
        if (this.polylinePathCache == null) {
            var polylinePath = new java.awt.geom.GeneralPath();
            if (this.joinStyle === Polyline.JoinStyle.CURVED) {
                for (var i = 0, n = this.closedPath ? this.points.length : this.points.length - 1; i < n; i++) {
                    var curve2D = new java.awt.geom.CubicCurve2D.Float();
                    var previousPoint = this.points[i === 0 ? this.points.length - 1 : i - 1];
                    var point = this.points[i];
                    var nextPoint = this.points[i === this.points.length - 1 ? 0 : i + 1];
                    var vectorToBisectorPoint = [nextPoint[0] - previousPoint[0], nextPoint[1] - previousPoint[1]];
                    var nextNextPoint = this.points[(i + 2) % this.points.length];
                    var vectorToBisectorNextPoint = [point[0] - nextNextPoint[0], point[1] - nextNextPoint[1]];
                    curve2D.setCurve(point[0], point[1], point[0] + (i !== 0 || this.closedPath ? vectorToBisectorPoint[0] / 3.625 : 0), point[1] + (i !== 0 || this.closedPath ? vectorToBisectorPoint[1] / 3.625 : 0), nextPoint[0] + (i !== this.points.length - 2 || this.closedPath ? vectorToBisectorNextPoint[0] / 3.625 : 0), nextPoint[1] + (i !== this.points.length - 2 || this.closedPath ? vectorToBisectorNextPoint[1] / 3.625 : 0), nextPoint[0], nextPoint[1]);
                    polylinePath.append(curve2D, true);
                }
            }
            else {
                polylinePath.moveTo(this.points[0][0], this.points[0][1]);
                for (var i = 1; i < this.points.length; i++) {
                    polylinePath.lineTo(this.points[i][0], this.points[i][1]);
                }
                if (this.closedPath) {
                    polylinePath.closePath();
                }
            }
            this.polylinePathCache = polylinePath;
        }
        return this.polylinePathCache;
    };
    /**
     * Returns the shape matching this polyline.
     * @return {java.awt.Shape}
     * @private
     */
    Polyline.prototype.getShape = function () {
        if (this.shapeCache == null) {
            this.shapeCache = this.getPolylinePath();
        }
        return this.shapeCache;
    };
    /**
     * Moves this polyline of (<code>dx</code>, <code>dy</code>) units.
     * @param {number} dx
     * @param {number} dy
     */
    Polyline.prototype.move = function (dx, dy) {
        if (dx !== 0 || dy !== 0) {
            var points = this.getPoints();
            for (var i = 0; i < points.length; i++) {
                points[i][0] += dx;
                points[i][1] += dy;
            }
            this.updatePoints(points);
        }
    };
    /**
     * Returns a clone of this polyline.
     * @return {Polyline}
     */
    Polyline.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_7 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_7[p] = o[p];
            }
            return clone_7;
        } })(this);
        clone.propertyChangeSupport = new PropertyChangeSupport(clone);
        clone.level = null;
        return clone;
    };
    return Polyline;
}(HomeObject));
Polyline["__class"] = "Polyline";
Polyline["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "com.eteks.sweethome3d.model.Elevatable", "java.io.Serializable"];
(function (Polyline) {
    var CapStyle;
    (function (CapStyle) {
        CapStyle[CapStyle["BUTT"] = 0] = "BUTT";
        CapStyle[CapStyle["SQUARE"] = 1] = "SQUARE";
        CapStyle[CapStyle["ROUND"] = 2] = "ROUND";
    })(CapStyle = Polyline.CapStyle || (Polyline.CapStyle = {}));
    var JoinStyle;
    (function (JoinStyle) {
        JoinStyle[JoinStyle["BEVEL"] = 0] = "BEVEL";
        JoinStyle[JoinStyle["MITER"] = 1] = "MITER";
        JoinStyle[JoinStyle["ROUND"] = 2] = "ROUND";
        JoinStyle[JoinStyle["CURVED"] = 3] = "CURVED";
    })(JoinStyle = Polyline.JoinStyle || (Polyline.JoinStyle = {}));
    var ArrowStyle;
    (function (ArrowStyle) {
        ArrowStyle[ArrowStyle["NONE"] = 0] = "NONE";
        ArrowStyle[ArrowStyle["DELTA"] = 1] = "DELTA";
        ArrowStyle[ArrowStyle["OPEN"] = 2] = "OPEN";
        ArrowStyle[ArrowStyle["DISC"] = 3] = "DISC";
    })(ArrowStyle = Polyline.ArrowStyle || (Polyline.ArrowStyle = {}));
    var DashStyle;
    (function (DashStyle) {
        DashStyle[DashStyle["SOLID"] = 0] = "SOLID";
        DashStyle[DashStyle["DOT"] = 1] = "DOT";
        DashStyle[DashStyle["DASH"] = 2] = "DASH";
        DashStyle[DashStyle["DASH_DOT"] = 3] = "DASH_DOT";
        DashStyle[DashStyle["DASH_DOT_DOT"] = 4] = "DASH_DOT_DOT";
    })(DashStyle = Polyline.DashStyle || (Polyline.DashStyle = {}));
})(Polyline || (Polyline = {}));
/**
 * Creates a room from its name and the given coordinates.
 * @param {Array} points
 * @class
 */
var Room = (function (_super) {
    __extends(Room, _super);
    function Room(points) {
        var _this = _super.call(this) || this;
        /*private*/ _this.propertyChangeSupport = new PropertyChangeSupport(_this);
        _this.name = null;
        _this.nameXOffset = 0;
        _this.nameYOffset = 0;
        _this.nameStyle = null;
        _this.nameAngle = 0;
        _this.points = null;
        _this.areaVisible = false;
        _this.areaXOffset = 0;
        _this.areaYOffset = 0;
        _this.areaStyle = null;
        _this.areaAngle = 0;
        _this.floorVisible = false;
        _this.floorColor = null;
        _this.floorTexture = null;
        _this.floorShininess = 0;
        _this.ceilingVisible = false;
        _this.ceilingColor = null;
        _this.ceilingTexture = null;
        _this.ceilingShininess = 0;
        _this.level = null;
        _this.shapeCache = null;
        _this.areaCache = null;
        if (points.length <= 1) {
            throw new IllegalStateException("Room points must containt at least two points");
        }
        _this.points = _this.deepCopy(points);
        _this.areaVisible = true;
        _this.nameYOffset = -40.0;
        _this.floorVisible = true;
        _this.ceilingVisible = true;
        return _this;
    }
    Room.TWICE_PI_$LI$ = function () { if (Room.TWICE_PI == null)
        Room.TWICE_PI = 2 * Math.PI; return Room.TWICE_PI; };
    ;
    /**
     * Adds the property change <code>listener</code> in parameter to this wall.
     * @param {PropertyChangeListener} listener
     */
    Room.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this wall.
     * @param {PropertyChangeListener} listener
     */
    Room.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
    };
    /**
     * Returns the name of this room.
     * @return {string}
     */
    Room.prototype.getName = function () {
        return this.name;
    };
    /**
     * Sets the name of this room. Once this room is updated,
     * listeners added to this room will receive a change notification.
     * @param {string} name
     */
    Room.prototype.setName = function (name) {
        if (name !== this.name && (name == null || !(name === this.name))) {
            var oldName = this.name;
            this.name = name;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME", oldName, name);
        }
    };
    /**
     * Returns the distance along x axis applied to room center abscissa
     * to display room name.
     * @return {number}
     */
    Room.prototype.getNameXOffset = function () {
        return this.nameXOffset;
    };
    /**
     * Sets the distance along x axis applied to room center abscissa to display room name.
     * Once this room  is updated, listeners added to this room will receive a change notification.
     * @param {number} nameXOffset
     */
    Room.prototype.setNameXOffset = function (nameXOffset) {
        if (nameXOffset !== this.nameXOffset) {
            var oldNameXOffset = this.nameXOffset;
            this.nameXOffset = nameXOffset;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME_X_OFFSET", oldNameXOffset, nameXOffset);
        }
    };
    /**
     * Returns the distance along y axis applied to room center ordinate
     * to display room name.
     * @return {number}
     */
    Room.prototype.getNameYOffset = function () {
        return this.nameYOffset;
    };
    /**
     * Sets the distance along y axis applied to room center ordinate to display room name.
     * Once this room is updated, listeners added to this room will receive a change notification.
     * @param {number} nameYOffset
     */
    Room.prototype.setNameYOffset = function (nameYOffset) {
        if (nameYOffset !== this.nameYOffset) {
            var oldNameYOffset = this.nameYOffset;
            this.nameYOffset = nameYOffset;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME_Y_OFFSET", oldNameYOffset, nameYOffset);
        }
    };
    /**
     * Returns the text style used to display room name.
     * @return {TextStyle}
     */
    Room.prototype.getNameStyle = function () {
        return this.nameStyle;
    };
    /**
     * Sets the text style used to display room name.
     * Once this room is updated, listeners added to this room will receive a change notification.
     * @param {TextStyle} nameStyle
     */
    Room.prototype.setNameStyle = function (nameStyle) {
        if (nameStyle !== this.nameStyle) {
            var oldNameStyle = this.nameStyle;
            this.nameStyle = nameStyle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME_STYLE", oldNameStyle, nameStyle);
        }
    };
    /**
     * Returns the angle in radians used to display the room name.
     * @since 3.6
     * @return {number}
     */
    Room.prototype.getNameAngle = function () {
        return this.nameAngle;
    };
    /**
     * Sets the angle in radians used to display the room name. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @since 3.6
     * @param {number} nameAngle
     */
    Room.prototype.setNameAngle = function (nameAngle) {
        nameAngle = (Math.fround ? (((nameAngle % Room.TWICE_PI_$LI$() + Room.TWICE_PI_$LI$()) % Room.TWICE_PI_$LI$())) : Math.fround(((nameAngle % Room.TWICE_PI_$LI$() + Room.TWICE_PI_$LI$()) % Room.TWICE_PI_$LI$())));
        if (nameAngle !== this.nameAngle) {
            var oldNameAngle = this.nameAngle;
            this.nameAngle = nameAngle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME_ANGLE", oldNameAngle, nameAngle);
        }
    };
    /**
     * Returns the points of the polygon matching this room.
     * @return {Array} an array of the (x,y) coordinates of the room points.
     */
    Room.prototype.getPoints = function () {
        return this.deepCopy(this.points);
    };
    /**
     * Returns the number of points of the polygon matching this room.
     * @since 2.0
     * @return {number}
     */
    Room.prototype.getPointCount = function () {
        return this.points.length;
    };
    Room.prototype.deepCopy = function (points) {
        var pointsCopy = new Array(points.length);
        for (var i = 0; i < points.length; i++) {
            pointsCopy[i] = points[i].slice(0);
        }
        return pointsCopy;
    };
    /**
     * Sets the points of the polygon matching this room. Once this room
     * is updated, listeners added to this room will receive a change notification.
     * @param {Array} points
     */
    Room.prototype.setPoints = function (points) {
        if (!(JSON.stringify(this.points) === JSON.stringify(points))) {
            this.updatePoints(points);
        }
    };
    /**
     * Update the points of the polygon matching this room.
     * @param {Array} points
     * @private
     */
    Room.prototype.updatePoints = function (points) {
        var oldPoints = this.points;
        this.points = this.deepCopy(points);
        this.shapeCache = null;
        this.areaCache = null;
        this.propertyChangeSupport.firePropertyChange(/* name */ "POINTS", oldPoints, points);
    };
    /**
     * Adds a point at the end of room points.
     * @since 2.0
     * @param {number} x
     * @param {number} y
     */
    Room.prototype.addPoint$float$float = function (x, y) {
        this.addPoint$float$float$int(x, y, this.points.length);
    };
    /**
     * Adds a point at the given <code>index</code>.
     * @throws IndexOutOfBoundsException if <code>index</code> is negative or > <code>getPointCount()</code>
     * @since 2.0
     * @param {number} x
     * @param {number} y
     * @param {number} index
     */
    Room.prototype.addPoint$float$float$int = function (x, y, index) {
        if (index < 0 || index > this.points.length) {
            throw Object.defineProperty(new Error("Invalid index " + index), '__class', { configurable: true, value: 'java.lang.IndexOutOfBoundsException' });
        }
        var newPoints = new Array(this.points.length + 1);
        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
            while (--size >= 0)
                dstPts[dstOff++] = srcPts[srcOff++];
        }
        else {
            var tmp = srcPts.slice(srcOff, srcOff + size);
            for (var i = 0; i < size; i++)
                dstPts[dstOff++] = tmp[i];
        } })(this.points, 0, newPoints, 0, index);
        newPoints[index] = [x, y];
        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
            while (--size >= 0)
                dstPts[dstOff++] = srcPts[srcOff++];
        }
        else {
            var tmp = srcPts.slice(srcOff, srcOff + size);
            for (var i = 0; i < size; i++)
                dstPts[dstOff++] = tmp[i];
        } })(this.points, index, newPoints, index + 1, this.points.length - index);
        var oldPoints = this.points;
        this.points = newPoints;
        this.shapeCache = null;
        this.areaCache = null;
        this.propertyChangeSupport.firePropertyChange(/* name */ "POINTS", oldPoints, this.deepCopy(this.points));
    };
    /**
     * Adds a point at the given <code>index</code>.
     * @throws IndexOutOfBoundsException if <code>index</code> is negative or > <code>getPointCount()</code>
     * @since 2.0
     * @param {number} x
     * @param {number} y
     * @param {number} index
     */
    Room.prototype.addPoint = function (x, y, index) {
        if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof index === 'number') || index === null)) {
            return this.addPoint$float$float$int(x, y, index);
        }
        else if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && index === undefined) {
            return this.addPoint$float$float(x, y);
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Sets the point at the given <code>index</code>.
     * @throws IndexOutOfBoundsException if <code>index</code> is negative or >= <code>getPointCount()</code>
     * @since 2.0
     * @param {number} x
     * @param {number} y
     * @param {number} index
     */
    Room.prototype.setPoint = function (x, y, index) {
        if (index < 0 || index >= this.points.length) {
            throw Object.defineProperty(new Error("Invalid index " + index), '__class', { configurable: true, value: 'java.lang.IndexOutOfBoundsException' });
        }
        if (this.points[index][0] !== x || this.points[index][1] !== y) {
            var oldPoints = this.points;
            this.points = this.deepCopy(this.points);
            this.points[index][0] = x;
            this.points[index][1] = y;
            this.shapeCache = null;
            this.areaCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "POINTS", oldPoints, this.deepCopy(this.points));
        }
    };
    /**
     * Removes the point at the given <code>index</code>.
     * @throws IndexOutOfBoundsException if <code>index</code> is negative or >= <code>getPointCount()</code>
     * @since 2.0
     * @param {number} index
     */
    Room.prototype.removePoint = function (index) {
        if (index < 0 || index >= this.points.length) {
            throw Object.defineProperty(new Error("Invalid index " + index), '__class', { configurable: true, value: 'java.lang.IndexOutOfBoundsException' });
        }
        else if (this.points.length <= 1) {
            throw new IllegalStateException("Room points must containt at least one point");
        }
        var newPoints = new Array(this.points.length - 1);
        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
            while (--size >= 0)
                dstPts[dstOff++] = srcPts[srcOff++];
        }
        else {
            var tmp = srcPts.slice(srcOff, srcOff + size);
            for (var i = 0; i < size; i++)
                dstPts[dstOff++] = tmp[i];
        } })(this.points, 0, newPoints, 0, index);
        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
            while (--size >= 0)
                dstPts[dstOff++] = srcPts[srcOff++];
        }
        else {
            var tmp = srcPts.slice(srcOff, srcOff + size);
            for (var i = 0; i < size; i++)
                dstPts[dstOff++] = tmp[i];
        } })(this.points, index + 1, newPoints, index, this.points.length - index - 1);
        var oldPoints = this.points;
        this.points = newPoints;
        this.shapeCache = null;
        this.areaCache = null;
        this.propertyChangeSupport.firePropertyChange(/* name */ "POINTS", oldPoints, this.deepCopy(this.points));
    };
    /**
     * Returns whether the area of this room is visible or not.
     * @return {boolean}
     */
    Room.prototype.isAreaVisible = function () {
        return this.areaVisible;
    };
    /**
     * Sets whether the area of this room is visible or not. Once this room
     * is updated, listeners added to this room will receive a change notification.
     * @param {boolean} areaVisible
     */
    Room.prototype.setAreaVisible = function (areaVisible) {
        if (areaVisible !== this.areaVisible) {
            this.areaVisible = areaVisible;
            this.propertyChangeSupport.firePropertyChange(/* name */ "AREA_VISIBLE", !areaVisible, areaVisible);
        }
    };
    /**
     * Returns the distance along x axis applied to room center abscissa
     * to display room area.
     * @return {number}
     */
    Room.prototype.getAreaXOffset = function () {
        return this.areaXOffset;
    };
    /**
     * Sets the distance along x axis applied to room center abscissa to display room area.
     * Once this room  is updated, listeners added to this room will receive a change notification.
     * @param {number} areaXOffset
     */
    Room.prototype.setAreaXOffset = function (areaXOffset) {
        if (areaXOffset !== this.areaXOffset) {
            var oldAreaXOffset = this.areaXOffset;
            this.areaXOffset = areaXOffset;
            this.propertyChangeSupport.firePropertyChange(/* name */ "AREA_X_OFFSET", oldAreaXOffset, areaXOffset);
        }
    };
    /**
     * Returns the distance along y axis applied to room center ordinate
     * to display room area.
     * @return {number}
     */
    Room.prototype.getAreaYOffset = function () {
        return this.areaYOffset;
    };
    /**
     * Sets the distance along y axis applied to room center ordinate to display room area.
     * Once this room is updated, listeners added to this room will receive a change notification.
     * @param {number} areaYOffset
     */
    Room.prototype.setAreaYOffset = function (areaYOffset) {
        if (areaYOffset !== this.areaYOffset) {
            var oldAreaYOffset = this.areaYOffset;
            this.areaYOffset = areaYOffset;
            this.propertyChangeSupport.firePropertyChange(/* name */ "AREA_Y_OFFSET", oldAreaYOffset, areaYOffset);
        }
    };
    /**
     * Returns the text style used to display room area.
     * @return {TextStyle}
     */
    Room.prototype.getAreaStyle = function () {
        return this.areaStyle;
    };
    /**
     * Sets the text style used to display room area.
     * Once this room is updated, listeners added to this room will receive a change notification.
     * @param {TextStyle} areaStyle
     */
    Room.prototype.setAreaStyle = function (areaStyle) {
        if (areaStyle !== this.areaStyle) {
            var oldAreaStyle = this.areaStyle;
            this.areaStyle = areaStyle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "AREA_STYLE", oldAreaStyle, areaStyle);
        }
    };
    /**
     * Returns the angle in radians used to display the room area.
     * @since 3.6
     * @return {number}
     */
    Room.prototype.getAreaAngle = function () {
        return this.areaAngle;
    };
    /**
     * Sets the angle in radians used to display the room area. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @since 3.6
     * @param {number} areaAngle
     */
    Room.prototype.setAreaAngle = function (areaAngle) {
        areaAngle = (Math.fround ? (((areaAngle % Room.TWICE_PI_$LI$() + Room.TWICE_PI_$LI$()) % Room.TWICE_PI_$LI$())) : Math.fround(((areaAngle % Room.TWICE_PI_$LI$() + Room.TWICE_PI_$LI$()) % Room.TWICE_PI_$LI$())));
        if (areaAngle !== this.areaAngle) {
            var oldAreaAngle = this.areaAngle;
            this.areaAngle = areaAngle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "AREA_ANGLE", oldAreaAngle, areaAngle);
        }
    };
    /**
     * Returns the abscissa of the center point of this room.
     * @return {number}
     */
    Room.prototype.getXCenter = function () {
        var xMin = this.points[0][0];
        var xMax = this.points[0][0];
        for (var i = 1; i < this.points.length; i++) {
            xMin = Math.min(xMin, this.points[i][0]);
            xMax = Math.max(xMax, this.points[i][0]);
        }
        return (xMin + xMax) / 2;
    };
    /**
     * Returns the ordinate of the center point of this room.
     * @return {number}
     */
    Room.prototype.getYCenter = function () {
        var yMin = this.points[0][1];
        var yMax = this.points[0][1];
        for (var i = 1; i < this.points.length; i++) {
            yMin = Math.min(yMin, this.points[i][1]);
            yMax = Math.max(yMax, this.points[i][1]);
        }
        return (yMin + yMax) / 2;
    };
    /**
     * Returns the floor color of this room.
     * @return {number}
     */
    Room.prototype.getFloorColor = function () {
        return this.floorColor;
    };
    /**
     * Sets the floor color of this room. Once this room is updated,
     * listeners added to this room will receive a change notification.
     * @param {number} floorColor
     */
    Room.prototype.setFloorColor = function (floorColor) {
        if (floorColor !== this.floorColor && (floorColor == null || !(floorColor === this.floorColor))) {
            var oldFloorColor = this.floorColor;
            this.floorColor = floorColor;
            this.propertyChangeSupport.firePropertyChange(/* name */ "FLOOR_COLOR", oldFloorColor, floorColor);
        }
    };
    /**
     * Returns the floor texture of this room.
     * @return {HomeTexture}
     */
    Room.prototype.getFloorTexture = function () {
        return this.floorTexture;
    };
    /**
     * Sets the floor texture of this room. Once this room is updated,
     * listeners added to this room will receive a change notification.
     * @param {HomeTexture} floorTexture
     */
    Room.prototype.setFloorTexture = function (floorTexture) {
        if (floorTexture !== this.floorTexture && (floorTexture == null || !(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(floorTexture, this.floorTexture))) {
            var oldFloorTexture = this.floorTexture;
            this.floorTexture = floorTexture;
            this.propertyChangeSupport.firePropertyChange(/* name */ "FLOOR_TEXTURE", oldFloorTexture, floorTexture);
        }
    };
    /**
     * Returns whether the floor of this room is visible or not.
     * @return {boolean}
     */
    Room.prototype.isFloorVisible = function () {
        return this.floorVisible;
    };
    /**
     * Sets whether the floor of this room is visible or not. Once this room
     * is updated, listeners added to this room will receive a change notification.
     * @param {boolean} floorVisible
     */
    Room.prototype.setFloorVisible = function (floorVisible) {
        if (floorVisible !== this.floorVisible) {
            this.floorVisible = floorVisible;
            this.propertyChangeSupport.firePropertyChange(/* name */ "FLOOR_VISIBLE", !floorVisible, floorVisible);
        }
    };
    /**
     * Returns the floor shininess of this room.
     * @return {number} a value between 0 (matt) and 1 (very shiny)
     * @since 3.0
     */
    Room.prototype.getFloorShininess = function () {
        return this.floorShininess;
    };
    /**
     * Sets the floor shininess of this room. Once this room is updated,
     * listeners added to this room will receive a change notification.
     * @since 3.0
     * @param {number} floorShininess
     */
    Room.prototype.setFloorShininess = function (floorShininess) {
        if (floorShininess !== this.floorShininess) {
            var oldFloorShininess = this.floorShininess;
            this.floorShininess = floorShininess;
            this.propertyChangeSupport.firePropertyChange(/* name */ "FLOOR_SHININESS", oldFloorShininess, floorShininess);
        }
    };
    /**
     * Returns the ceiling color color of this room.
     * @return {number}
     */
    Room.prototype.getCeilingColor = function () {
        return this.ceilingColor;
    };
    /**
     * Sets the ceiling color of this room. Once this room is updated,
     * listeners added to this room will receive a change notification.
     * @param {number} ceilingColor
     */
    Room.prototype.setCeilingColor = function (ceilingColor) {
        if (ceilingColor !== this.ceilingColor && (ceilingColor == null || !(ceilingColor === this.ceilingColor))) {
            var oldCeilingColor = this.ceilingColor;
            this.ceilingColor = ceilingColor;
            this.propertyChangeSupport.firePropertyChange(/* name */ "CEILING_COLOR", oldCeilingColor, ceilingColor);
        }
    };
    /**
     * Returns the ceiling texture of this room.
     * @return {HomeTexture}
     */
    Room.prototype.getCeilingTexture = function () {
        return this.ceilingTexture;
    };
    /**
     * Sets the ceiling texture of this room. Once this room is updated,
     * listeners added to this room will receive a change notification.
     * @param {HomeTexture} ceilingTexture
     */
    Room.prototype.setCeilingTexture = function (ceilingTexture) {
        if (ceilingTexture !== this.ceilingTexture && (ceilingTexture == null || !(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(ceilingTexture, this.ceilingTexture))) {
            var oldCeilingTexture = this.ceilingTexture;
            this.ceilingTexture = ceilingTexture;
            this.propertyChangeSupport.firePropertyChange(/* name */ "CEILING_TEXTURE", oldCeilingTexture, ceilingTexture);
        }
    };
    /**
     * Returns whether the ceiling of this room is visible or not.
     * @return {boolean}
     */
    Room.prototype.isCeilingVisible = function () {
        return this.ceilingVisible;
    };
    /**
     * Sets whether the ceiling of this room is visible or not. Once this room
     * is updated, listeners added to this room will receive a change notification.
     * @param {boolean} ceilingVisible
     */
    Room.prototype.setCeilingVisible = function (ceilingVisible) {
        if (ceilingVisible !== this.ceilingVisible) {
            this.ceilingVisible = ceilingVisible;
            this.propertyChangeSupport.firePropertyChange(/* name */ "CEILING_VISIBLE", !ceilingVisible, ceilingVisible);
        }
    };
    /**
     * Returns the ceiling shininess of this room.
     * @return {number} a value between 0 (matt) and 1 (very shiny)
     * @since 3.0
     */
    Room.prototype.getCeilingShininess = function () {
        return this.ceilingShininess;
    };
    /**
     * Sets the ceiling shininess of this room. Once this room is updated,
     * listeners added to this room will receive a change notification.
     * @since 3.0
     * @param {number} ceilingShininess
     */
    Room.prototype.setCeilingShininess = function (ceilingShininess) {
        if (ceilingShininess !== this.ceilingShininess) {
            var oldCeilingShininess = this.ceilingShininess;
            this.ceilingShininess = ceilingShininess;
            this.propertyChangeSupport.firePropertyChange(/* name */ "CEILING_SHININESS", oldCeilingShininess, ceilingShininess);
        }
    };
    /**
     * Returns the level which this room belongs to.
     * @since 3.4
     * @return {Level}
     */
    Room.prototype.getLevel = function () {
        return this.level;
    };
    /**
     * Sets the level of this room. Once this room is updated,
     * listeners added to this room will receive a change notification.
     * @since 3.4
     * @param {Level} level
     */
    Room.prototype.setLevel = function (level) {
        if (level !== this.level) {
            var oldLevel = this.level;
            this.level = level;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LEVEL", oldLevel, level);
        }
    };
    /**
     * Returns <code>true</code> if this room is at the given <code>level</code>
     * or at a level with the same elevation and a smaller elevation index.
     * @since 3.4
     * @param {Level} level
     * @return {boolean}
     */
    Room.prototype.isAtLevel = function (level) {
        return this.level === level || this.level != null && level != null && this.level.getElevation() === level.getElevation() && this.level.getElevationIndex() < level.getElevationIndex();
    };
    /**
     * Returns the area of this room.
     * @return {number}
     */
    Room.prototype.getArea = function () {
        if (this.areaCache == null) {
            var roomArea = new java.awt.geom.Area(this.getShape());
            if (roomArea.isSingular()) {
                this.areaCache = Math.abs(this.getSignedArea(this.getPoints()));
            }
            else {
                var area = 0;
                var currentPathPoints = ([]);
                for (var it = roomArea.getPathIterator(null); !it.isDone();) {
                    var roomPoint = [0, 0];
                    switch ((it.currentSegment(roomPoint))) {
                        case java.awt.geom.PathIterator.SEG_MOVETO:
                            /* add */ currentPathPoints.push(roomPoint);
                            break;
                        case java.awt.geom.PathIterator.SEG_LINETO:
                            /* add */ currentPathPoints.push(roomPoint);
                            break;
                        case java.awt.geom.PathIterator.SEG_CLOSE:
                            var pathPoints = currentPathPoints.slice(0);
                            area += this.getSignedArea(pathPoints);
                            /* clear */ (currentPathPoints.length = 0);
                            break;
                    }
                    it.next();
                }
                this.areaCache = area;
            }
        }
        return this.areaCache;
    };
    Room.prototype.getSignedArea = function (areaPoints) {
        var area = 0;
        for (var i = 1; i < areaPoints.length; i++) {
            area += areaPoints[i][0] * areaPoints[i - 1][1];
            area -= areaPoints[i][1] * areaPoints[i - 1][0];
        }
        area += areaPoints[0][0] * areaPoints[areaPoints.length - 1][1];
        area -= areaPoints[0][1] * areaPoints[areaPoints.length - 1][0];
        return area / 2;
    };
    /**
     * Returns <code>true</code> if the points of this room are in clockwise order.
     * @return {boolean}
     */
    Room.prototype.isClockwise = function () {
        return this.getSignedArea(this.getPoints()) < 0;
    };
    /**
     * Returns <code>true</code> if this room is comprised of only one polygon.
     * @return {boolean}
     */
    Room.prototype.isSingular = function () {
        return new java.awt.geom.Area(this.getShape()).isSingular();
    };
    /**
     * Returns <code>true</code> if this room intersects
     * with the horizontal rectangle which opposite corners are at points
     * (<code>x0</code>, <code>y0</code>) and (<code>x1</code>, <code>y1</code>).
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {boolean}
     */
    Room.prototype.intersectsRectangle = function (x0, y0, x1, y1) {
        var rectangle = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
        rectangle.add(x1, y1);
        return this.getShape().intersects(rectangle);
    };
    /**
     * Returns <code>true</code> if this room contains
     * the point at (<code>x</code>, <code>y</code>) with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    Room.prototype.containsPoint = function (x, y, margin) {
        return this.containsShapeAtWithMargin(this.getShape(), x, y, margin);
    };
    /**
     * Returns the index of the point of this room equal to
     * the point at (<code>x</code>, <code>y</code>) with a given <code>margin</code>.
     * @return {number} the index of the first found point or -1.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     */
    Room.prototype.getPointIndexAt = function (x, y, margin) {
        for (var i = 0; i < this.points.length; i++) {
            if (Math.abs(x - this.points[i][0]) <= margin && Math.abs(y - this.points[i][1]) <= margin) {
                return i;
            }
        }
        return -1;
    };
    /**
     * Returns <code>true</code> if the center point at which is displayed the name
     * of this room is equal to the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    Room.prototype.isNameCenterPointAt = function (x, y, margin) {
        return Math.abs(x - this.getXCenter() - this.getNameXOffset()) <= margin && Math.abs(y - this.getYCenter() - this.getNameYOffset()) <= margin;
    };
    /**
     * Returns <code>true</code> if the center point at which is displayed the area
     * of this room is equal to the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    Room.prototype.isAreaCenterPointAt = function (x, y, margin) {
        return Math.abs(x - this.getXCenter() - this.getAreaXOffset()) <= margin && Math.abs(y - this.getYCenter() - this.getAreaYOffset()) <= margin;
    };
    /**
     * Returns <code>true</code> if <code>shape</code> contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {java.awt.Shape} shape
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     * @private
     */
    Room.prototype.containsShapeAtWithMargin = function (shape, x, y, margin) {
        if (margin === 0) {
            return shape.contains(x, y);
        }
        else {
            return shape.intersects(x - margin, y - margin, 2 * margin, 2 * margin);
        }
    };
    /**
     * Returns the shape matching this room.
     * @return {java.awt.Shape}
     * @private
     */
    Room.prototype.getShape = function () {
        if (this.shapeCache == null) {
            var roomShape = new java.awt.geom.GeneralPath();
            roomShape.moveTo(this.points[0][0], this.points[0][1]);
            for (var i = 1; i < this.points.length; i++) {
                roomShape.lineTo(this.points[i][0], this.points[i][1]);
            }
            roomShape.closePath();
            this.shapeCache = roomShape;
        }
        return this.shapeCache;
    };
    /**
     * Moves this room of (<code>dx</code>, <code>dy</code>) units.
     * @param {number} dx
     * @param {number} dy
     */
    Room.prototype.move = function (dx, dy) {
        if (dx !== 0 || dy !== 0) {
            var points = this.getPoints();
            for (var i = 0; i < points.length; i++) {
                points[i][0] += dx;
                points[i][1] += dy;
            }
            this.updatePoints(points);
        }
    };
    /**
     * Returns a clone of this room.
     * @return {Room}
     */
    Room.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_8 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_8[p] = o[p];
            }
            return clone_8;
        } })(this);
        clone.propertyChangeSupport = new PropertyChangeSupport(clone);
        clone.level = null;
        return clone;
    };
    return Room;
}(HomeObject));
Room["__class"] = "Room";
Room["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "com.eteks.sweethome3d.model.Elevatable", "java.io.Serializable"];
/**
 * Creates a wall from (<code>xStart</code>,<code>yStart</code>)
 * to (<code>xEnd</code>, <code>yEnd</code>),
 * with given thickness, height and pattern.
 * Colors are <code>null</code>.
 * @since 4.0
 * @param {number} xStart
 * @param {number} yStart
 * @param {number} xEnd
 * @param {number} yEnd
 * @param {number} thickness
 * @param {number} height
 * @param {TextureImage} pattern
 * @class
 */
var Wall = (function (_super) {
    __extends(Wall, _super);
    function Wall(xStart, yStart, xEnd, yEnd, thickness, height, pattern) {
        var _this = this;
        if (((typeof xStart === 'number') || xStart === null) && ((typeof yStart === 'number') || yStart === null) && ((typeof xEnd === 'number') || xEnd === null) && ((typeof yEnd === 'number') || yEnd === null) && ((typeof thickness === 'number') || thickness === null) && ((typeof height === 'number') || height === null) && ((pattern != null && (pattern["__interfaces"] != null && pattern["__interfaces"].indexOf("com.eteks.sweethome3d.model.TextureImage") >= 0 || pattern.constructor != null && pattern.constructor["__interfaces"] != null && pattern.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.TextureImage") >= 0)) || pattern === null)) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this) || this;
            _this.xStart = 0;
            _this.yStart = 0;
            _this.xEnd = 0;
            _this.yEnd = 0;
            _this.arcExtent = null;
            _this.wallAtStart = null;
            _this.wallAtEnd = null;
            _this.thickness = 0;
            _this.height = null;
            _this.heightAtEnd = null;
            _this.leftSideColor = null;
            _this.leftSideTexture = null;
            _this.leftSideShininess = 0;
            _this.leftSideBaseboard = null;
            _this.rightSideColor = null;
            _this.rightSideTexture = null;
            _this.rightSideShininess = 0;
            _this.rightSideBaseboard = null;
            _this.pattern = null;
            _this.topColor = null;
            _this.level = null;
            _this.pointsCache = null;
            _this.pointsIncludingBaseboardsCache = null;
            _this.symmetric = true;
            _this.propertyChangeSupport = new PropertyChangeSupport(_this);
            _this.xStart = 0;
            _this.yStart = 0;
            _this.xEnd = 0;
            _this.yEnd = 0;
            _this.arcExtent = null;
            _this.wallAtStart = null;
            _this.wallAtEnd = null;
            _this.thickness = 0;
            _this.height = null;
            _this.heightAtEnd = null;
            _this.leftSideColor = null;
            _this.leftSideTexture = null;
            _this.leftSideShininess = 0;
            _this.leftSideBaseboard = null;
            _this.rightSideColor = null;
            _this.rightSideTexture = null;
            _this.rightSideShininess = 0;
            _this.rightSideBaseboard = null;
            _this.pattern = null;
            _this.topColor = null;
            _this.level = null;
            _this.pointsCache = null;
            _this.pointsIncludingBaseboardsCache = null;
            (function () {
                _this.xStart = xStart;
                _this.yStart = yStart;
                _this.xEnd = xEnd;
                _this.yEnd = yEnd;
                _this.thickness = thickness;
                _this.height = height;
                _this.pattern = pattern;
            })();
        }
        else if (((typeof xStart === 'number') || xStart === null) && ((typeof yStart === 'number') || yStart === null) && ((typeof xEnd === 'number') || xEnd === null) && ((typeof yEnd === 'number') || yEnd === null) && ((typeof thickness === 'number') || thickness === null) && ((typeof height === 'number') || height === null) && pattern === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_27 = Array.prototype.slice.call(arguments);
                var pattern_1 = null;
                _this = _super.call(this) || this;
                _this.xStart = 0;
                _this.yStart = 0;
                _this.xEnd = 0;
                _this.yEnd = 0;
                _this.arcExtent = null;
                _this.wallAtStart = null;
                _this.wallAtEnd = null;
                _this.thickness = 0;
                _this.height = null;
                _this.heightAtEnd = null;
                _this.leftSideColor = null;
                _this.leftSideTexture = null;
                _this.leftSideShininess = 0;
                _this.leftSideBaseboard = null;
                _this.rightSideColor = null;
                _this.rightSideTexture = null;
                _this.rightSideShininess = 0;
                _this.rightSideBaseboard = null;
                _this.pattern = null;
                _this.topColor = null;
                _this.level = null;
                _this.pointsCache = null;
                _this.pointsIncludingBaseboardsCache = null;
                _this.symmetric = true;
                _this.propertyChangeSupport = new PropertyChangeSupport(_this);
                _this.xStart = 0;
                _this.yStart = 0;
                _this.xEnd = 0;
                _this.yEnd = 0;
                _this.arcExtent = null;
                _this.wallAtStart = null;
                _this.wallAtEnd = null;
                _this.thickness = 0;
                _this.height = null;
                _this.heightAtEnd = null;
                _this.leftSideColor = null;
                _this.leftSideTexture = null;
                _this.leftSideShininess = 0;
                _this.leftSideBaseboard = null;
                _this.rightSideColor = null;
                _this.rightSideTexture = null;
                _this.rightSideShininess = 0;
                _this.rightSideBaseboard = null;
                _this.pattern = null;
                _this.topColor = null;
                _this.level = null;
                _this.pointsCache = null;
                _this.pointsIncludingBaseboardsCache = null;
                (function () {
                    _this.xStart = xStart;
                    _this.yStart = yStart;
                    _this.xEnd = xEnd;
                    _this.yEnd = yEnd;
                    _this.thickness = thickness;
                    _this.height = height;
                    _this.pattern = pattern_1;
                })();
            }
        }
        else
            throw new Error('invalid overload');
        return _this;
    }
    /**
     * Adds the property change <code>listener</code> in parameter to this wall.
     * @param {PropertyChangeListener} listener
     */
    Wall.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this wall.
     * @param {PropertyChangeListener} listener
     */
    Wall.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
    };
    /**
     * Returns the start point abscissa of this wall.
     * @return {number}
     */
    Wall.prototype.getXStart = function () {
        return this.xStart;
    };
    /**
     * Sets the start point abscissa of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {number} xStart
     */
    Wall.prototype.setXStart = function (xStart) {
        if (xStart !== this.xStart) {
            var oldXStart = this.xStart;
            this.xStart = xStart;
            this.clearPointsCache();
            this.propertyChangeSupport.firePropertyChange(/* name */ "X_START", oldXStart, xStart);
        }
    };
    /**
     * Returns the start point ordinate of this wall.
     * @return {number}
     */
    Wall.prototype.getYStart = function () {
        return this.yStart;
    };
    /**
     * Sets the start point ordinate of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {number} yStart
     */
    Wall.prototype.setYStart = function (yStart) {
        if (yStart !== this.yStart) {
            var oldYStart = this.yStart;
            this.yStart = yStart;
            this.clearPointsCache();
            this.propertyChangeSupport.firePropertyChange(/* name */ "Y_START", oldYStart, yStart);
        }
    };
    /**
     * Returns the end point abscissa of this wall.
     * @return {number}
     */
    Wall.prototype.getXEnd = function () {
        return this.xEnd;
    };
    /**
     * Sets the end point abscissa of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {number} xEnd
     */
    Wall.prototype.setXEnd = function (xEnd) {
        if (xEnd !== this.xEnd) {
            var oldXEnd = this.xEnd;
            this.xEnd = xEnd;
            this.clearPointsCache();
            this.propertyChangeSupport.firePropertyChange(/* name */ "X_END", oldXEnd, xEnd);
        }
    };
    /**
     * Returns the end point ordinate of this wall.
     * @return {number}
     */
    Wall.prototype.getYEnd = function () {
        return this.yEnd;
    };
    /**
     * Sets the end point ordinate of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {number} yEnd
     */
    Wall.prototype.setYEnd = function (yEnd) {
        if (yEnd !== this.yEnd) {
            var oldYEnd = this.yEnd;
            this.yEnd = yEnd;
            this.clearPointsCache();
            this.propertyChangeSupport.firePropertyChange(/* name */ "Y_END", oldYEnd, yEnd);
        }
    };
    /**
     * Returns the length of this wall.
     * @since 2.0
     * @return {number}
     */
    Wall.prototype.getLength = function () {
        if (this.arcExtent == null || this.arcExtent === 0) {
            return (Math.fround ? (java.awt.geom.Point2D.distance(this.xStart, this.yStart, this.xEnd, this.yEnd)) : Math.fround(java.awt.geom.Point2D.distance(this.xStart, this.yStart, this.xEnd, this.yEnd)));
        }
        else {
            var arcCircleCenter = this.getArcCircleCenter();
            var arcCircleRadius = (Math.fround ? (java.awt.geom.Point2D.distance(this.xStart, this.yStart, arcCircleCenter[0], arcCircleCenter[1])) : Math.fround(java.awt.geom.Point2D.distance(this.xStart, this.yStart, arcCircleCenter[0], arcCircleCenter[1])));
            return Math.abs(this.arcExtent) * arcCircleRadius;
        }
    };
    /**
     * Returns the distance from the start point of this wall to its end point.
     * @since 3.0
     * @return {number}
     */
    Wall.prototype.getStartPointToEndPointDistance = function () {
        return (Math.fround ? (java.awt.geom.Point2D.distance(this.xStart, this.yStart, this.xEnd, this.yEnd)) : Math.fround(java.awt.geom.Point2D.distance(this.xStart, this.yStart, this.xEnd, this.yEnd)));
    };
    /**
     * Sets the arc extent of a round wall.
     * @since 3.0
     * @param {number} arcExtent
     */
    Wall.prototype.setArcExtent = function (arcExtent) {
        if (arcExtent !== this.arcExtent || (arcExtent != null && !(arcExtent === this.arcExtent))) {
            var oldArcExtent = this.arcExtent;
            this.arcExtent = arcExtent;
            this.clearPointsCache();
            this.propertyChangeSupport.firePropertyChange(/* name */ "ARC_EXTENT", oldArcExtent, arcExtent);
        }
    };
    /**
     * Returns the arc extent of a round wall or <code>null</code> if this wall isn't round.
     * @since 3.0
     * @return {number}
     */
    Wall.prototype.getArcExtent = function () {
        return this.arcExtent;
    };
    /**
     * Returns the abscissa of the arc circle center of this wall.
     * If the wall isn't round, the return abscissa is at the middle of the wall.
     * @since 3.0
     * @return {number}
     */
    Wall.prototype.getXArcCircleCenter = function () {
        if (this.arcExtent == null) {
            return (this.xStart + this.xEnd) / 2;
        }
        else {
            return this.getArcCircleCenter()[0];
        }
    };
    /**
     * Returns the ordinate of the arc circle center of this wall.
     * If the wall isn't round, the return ordinate is at the middle of the wall.
     * @since 3.0
     * @return {number}
     */
    Wall.prototype.getYArcCircleCenter = function () {
        if (this.arcExtent == null) {
            return (this.yStart + this.yEnd) / 2;
        }
        else {
            return this.getArcCircleCenter()[1];
        }
    };
    /**
     * Returns the coordinates of the arc circle center of this wall.
     * @return {Array}
     * @private
     */
    Wall.prototype.getArcCircleCenter = function () {
        var startToEndPointsDistance = java.awt.geom.Point2D.distance(this.xStart, this.yStart, this.xEnd, this.yEnd);
        var wallToStartPointArcCircleCenterAngle = Math.abs(this.arcExtent) > Math.PI ? -(Math.PI + this.arcExtent) / 2 : (Math.PI - this.arcExtent) / 2;
        var arcCircleCenterToWallDistance = -(Math.fround ? ((Math.tan(wallToStartPointArcCircleCenterAngle) * startToEndPointsDistance / 2)) : Math.fround((Math.tan(wallToStartPointArcCircleCenterAngle) * startToEndPointsDistance / 2)));
        var xMiddlePoint = (this.xStart + this.xEnd) / 2;
        var yMiddlePoint = (this.yStart + this.yEnd) / 2;
        var angle = Math.atan2(this.xStart - this.xEnd, this.yEnd - this.yStart);
        return [(Math.fround ? ((xMiddlePoint + arcCircleCenterToWallDistance * Math.cos(angle))) : Math.fround((xMiddlePoint + arcCircleCenterToWallDistance * Math.cos(angle)))), (Math.fround ? ((yMiddlePoint + arcCircleCenterToWallDistance * Math.sin(angle))) : Math.fround((yMiddlePoint + arcCircleCenterToWallDistance * Math.sin(angle))))];
    };
    /**
     * Returns the wall joined to this wall at start point.
     * @return {Wall}
     */
    Wall.prototype.getWallAtStart = function () {
        return this.wallAtStart;
    };
    /**
     * Sets the wall joined to this wall at start point and detachs the wall at start
     * from this wall if <code>detachJoinedWallAtStart</code> is true.
     * @param {Wall} wallAtStart
     * @param {boolean} detachJoinedWallAtStart
     * @private
     */
    Wall.prototype.setWallAtStart = function (wallAtStart, detachJoinedWallAtStart) {
        if (detachJoinedWallAtStart === void 0) { detachJoinedWallAtStart = true; }
        if (wallAtStart !== this.wallAtStart) {
            var oldWallAtStart = this.wallAtStart;
            this.wallAtStart = wallAtStart;
            this.clearPointsCache();
            this.propertyChangeSupport.firePropertyChange(/* name */ "WALL_AT_START", oldWallAtStart, wallAtStart);
            if (detachJoinedWallAtStart) {
                this.detachJoinedWall(oldWallAtStart);
            }
        }
    };
    /**
     * Returns the wall joined to this wall at end point.
     * @return {Wall}
     */
    Wall.prototype.getWallAtEnd = function () {
        return this.wallAtEnd;
    };
    /**
     * Sets the wall joined to this wall at end point and detachs the wall at end
     * from this wall if <code>detachJoinedWallAtEnd</code> is true.
     * @param {Wall} wallAtEnd
     * @param {boolean} detachJoinedWallAtEnd
     * @private
     */
    Wall.prototype.setWallAtEnd = function (wallAtEnd, detachJoinedWallAtEnd) {
        if (detachJoinedWallAtEnd === void 0) { detachJoinedWallAtEnd = true; }
        if (wallAtEnd !== this.wallAtEnd) {
            var oldWallAtEnd = this.wallAtEnd;
            this.wallAtEnd = wallAtEnd;
            this.clearPointsCache();
            this.propertyChangeSupport.firePropertyChange(/* name */ "WALL_AT_END", oldWallAtEnd, wallAtEnd);
            if (detachJoinedWallAtEnd) {
                this.detachJoinedWall(oldWallAtEnd);
            }
        }
    };
    /**
     * Detaches <code>joinedWall</code> from this wall.
     * @param {Wall} joinedWall
     * @private
     */
    Wall.prototype.detachJoinedWall = function (joinedWall) {
        if (joinedWall != null) {
            if (joinedWall.getWallAtStart() === this) {
                joinedWall.setWallAtStart(null, false);
            }
            else if (joinedWall.getWallAtEnd() === this) {
                joinedWall.setWallAtEnd(null, false);
            }
        }
    };
    /**
     * Returns the thickness of this wall.
     * @return {number}
     */
    Wall.prototype.getThickness = function () {
        return this.thickness;
    };
    /**
     * Sets wall thickness. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {number} thickness
     */
    Wall.prototype.setThickness = function (thickness) {
        if (thickness !== this.thickness) {
            var oldThickness = this.thickness;
            this.thickness = thickness;
            this.clearPointsCache();
            this.propertyChangeSupport.firePropertyChange(/* name */ "THICKNESS", oldThickness, thickness);
        }
    };
    /**
     * Returns the height of this wall. If {@link #getHeightAtEnd() getHeightAtEnd}
     * returns a value not <code>null</code>, the returned height should be
     * considered as the height of this wall at its start point.
     * @return {number}
     */
    Wall.prototype.getHeight = function () {
        return this.height;
    };
    /**
     * Sets the height of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {number} height
     */
    Wall.prototype.setHeight = function (height) {
        if (height !== this.height || (height != null && !(height === this.height))) {
            var oldHeight = this.height;
            this.height = height;
            this.propertyChangeSupport.firePropertyChange(/* name */ "HEIGHT", oldHeight, height);
        }
    };
    /**
     * Returns the height of this wall at its end point.
     * @return {number}
     */
    Wall.prototype.getHeightAtEnd = function () {
        return this.heightAtEnd;
    };
    /**
     * Sets the height of this wall at its end point. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {number} heightAtEnd
     */
    Wall.prototype.setHeightAtEnd = function (heightAtEnd) {
        if (heightAtEnd !== this.heightAtEnd && (heightAtEnd == null || !(heightAtEnd === this.heightAtEnd))) {
            var oldHeightAtEnd = this.heightAtEnd;
            this.heightAtEnd = heightAtEnd;
            this.propertyChangeSupport.firePropertyChange(/* name */ "HEIGHT_AT_END", oldHeightAtEnd, heightAtEnd);
        }
    };
    /**
     * Returns <code>true</code> if the height of this wall is different
     * at its start and end points.
     * @return {boolean}
     */
    Wall.prototype.isTrapezoidal = function () {
        return this.height != null && this.heightAtEnd != null && !(this.height === this.heightAtEnd);
    };
    /**
     * Returns left side color of this wall. This is the color of the left side
     * of this wall when you go through wall from start point to end point.
     * @return {number}
     */
    Wall.prototype.getLeftSideColor = function () {
        return this.leftSideColor;
    };
    /**
     * Sets left side color of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {number} leftSideColor
     */
    Wall.prototype.setLeftSideColor = function (leftSideColor) {
        if (leftSideColor !== this.leftSideColor && (leftSideColor == null || !(leftSideColor === this.leftSideColor))) {
            var oldLeftSideColor = this.leftSideColor;
            this.leftSideColor = leftSideColor;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LEFT_SIDE_COLOR", oldLeftSideColor, leftSideColor);
        }
    };
    /**
     * Returns right side color of this wall. This is the color of the right side
     * of this wall when you go through wall from start point to end point.
     * @return {number}
     */
    Wall.prototype.getRightSideColor = function () {
        return this.rightSideColor;
    };
    /**
     * Sets right side color of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {number} rightSideColor
     */
    Wall.prototype.setRightSideColor = function (rightSideColor) {
        if (rightSideColor !== this.rightSideColor && (rightSideColor == null || !(rightSideColor === this.rightSideColor))) {
            var oldLeftSideColor = this.rightSideColor;
            this.rightSideColor = rightSideColor;
            this.propertyChangeSupport.firePropertyChange(/* name */ "RIGHT_SIDE_COLOR", oldLeftSideColor, rightSideColor);
        }
    };
    /**
     * Returns the left side texture of this wall.
     * @return {HomeTexture}
     */
    Wall.prototype.getLeftSideTexture = function () {
        return this.leftSideTexture;
    };
    /**
     * Sets the left side texture of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {HomeTexture} leftSideTexture
     */
    Wall.prototype.setLeftSideTexture = function (leftSideTexture) {
        if (leftSideTexture !== this.leftSideTexture && (leftSideTexture == null || !(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(leftSideTexture, this.leftSideTexture))) {
            var oldLeftSideTexture = this.leftSideTexture;
            this.leftSideTexture = leftSideTexture;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LEFT_SIDE_TEXTURE", oldLeftSideTexture, leftSideTexture);
        }
    };
    /**
     * Returns the right side texture of this wall.
     * @return {HomeTexture}
     */
    Wall.prototype.getRightSideTexture = function () {
        return this.rightSideTexture;
    };
    /**
     * Sets the right side texture of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @param {HomeTexture} rightSideTexture
     */
    Wall.prototype.setRightSideTexture = function (rightSideTexture) {
        if (rightSideTexture !== this.rightSideTexture && (rightSideTexture == null || !(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(rightSideTexture, this.rightSideTexture))) {
            var oldLeftSideTexture = this.rightSideTexture;
            this.rightSideTexture = rightSideTexture;
            this.propertyChangeSupport.firePropertyChange(/* name */ "RIGHT_SIDE_TEXTURE", oldLeftSideTexture, rightSideTexture);
        }
    };
    /**
     * Returns the left side shininess of this wall.
     * @return {number} a value between 0 (matt) and 1 (very shiny)
     * @since 3.0
     */
    Wall.prototype.getLeftSideShininess = function () {
        return this.leftSideShininess;
    };
    /**
     * Sets the left side shininess of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @since 3.0
     * @param {number} leftSideShininess
     */
    Wall.prototype.setLeftSideShininess = function (leftSideShininess) {
        if (leftSideShininess !== this.leftSideShininess) {
            var oldLeftSideShininess = this.leftSideShininess;
            this.leftSideShininess = leftSideShininess;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LEFT_SIDE_SHININESS", oldLeftSideShininess, leftSideShininess);
        }
    };
    /**
     * Returns the right side shininess of this wall.
     * @return {number} a value between 0 (matt) and 1 (very shiny)
     * @since 3.0
     */
    Wall.prototype.getRightSideShininess = function () {
        return this.rightSideShininess;
    };
    /**
     * Sets the right side shininess of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @since 3.0
     * @param {number} rightSideShininess
     */
    Wall.prototype.setRightSideShininess = function (rightSideShininess) {
        if (rightSideShininess !== this.rightSideShininess) {
            var oldRightSideShininess = this.rightSideShininess;
            this.rightSideShininess = rightSideShininess;
            this.propertyChangeSupport.firePropertyChange(/* name */ "RIGHT_SIDE_SHININESS", oldRightSideShininess, rightSideShininess);
        }
    };
    /**
     * Returns the left side baseboard of this wall.
     * @since 5.0
     * @return {Baseboard}
     */
    Wall.prototype.getLeftSideBaseboard = function () {
        return this.leftSideBaseboard;
    };
    /**
     * Sets the left side baseboard of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @since 5.0
     * @param {Baseboard} leftSideBaseboard
     */
    Wall.prototype.setLeftSideBaseboard = function (leftSideBaseboard) {
        if (leftSideBaseboard !== this.leftSideBaseboard && (leftSideBaseboard == null || !(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(leftSideBaseboard, this.leftSideBaseboard))) {
            var oldLeftSideBaseboard = this.leftSideBaseboard;
            this.leftSideBaseboard = leftSideBaseboard;
            this.clearPointsCache();
            this.propertyChangeSupport.firePropertyChange(/* name */ "LEFT_SIDE_BASEBOARD", oldLeftSideBaseboard, leftSideBaseboard);
        }
    };
    /**
     * Returns the right side baseboard of this wall.
     * @since 5.0
     * @return {Baseboard}
     */
    Wall.prototype.getRightSideBaseboard = function () {
        return this.rightSideBaseboard;
    };
    /**
     * Sets the right side baseboard of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @since 5.0
     * @param {Baseboard} rightSideBaseboard
     */
    Wall.prototype.setRightSideBaseboard = function (rightSideBaseboard) {
        if (rightSideBaseboard !== this.rightSideBaseboard && (rightSideBaseboard == null || !(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(rightSideBaseboard, this.rightSideBaseboard))) {
            var oldRightSideBaseboard = this.rightSideBaseboard;
            this.rightSideBaseboard = rightSideBaseboard;
            this.clearPointsCache();
            this.propertyChangeSupport.firePropertyChange(/* name */ "RIGHT_SIDE_BASEBOARD", oldRightSideBaseboard, rightSideBaseboard);
        }
    };
    /**
     * Returns the pattern of this wall in the plan.
     * @since 3.3
     * @return {TextureImage}
     */
    Wall.prototype.getPattern = function () {
        return this.pattern;
    };
    /**
     * Sets the pattern of this wall in the plan, and notifies
     * listeners of this change.
     * @since 3.3
     * @param {TextureImage} pattern
     */
    Wall.prototype.setPattern = function (pattern) {
        if (this.pattern !== pattern) {
            var oldPattern = this.pattern;
            this.pattern = pattern;
            this.propertyChangeSupport.firePropertyChange(/* name */ "PATTERN", oldPattern, pattern);
        }
    };
    /**
     * Returns the color of the top of this wall in the 3D view.
     * @since 4.0
     * @return {number}
     */
    Wall.prototype.getTopColor = function () {
        return this.topColor;
    };
    /**
     * Sets the color of the top of this wall in the 3D view, and notifies
     * listeners of this change.
     * @since 4.0
     * @param {number} topColor
     */
    Wall.prototype.setTopColor = function (topColor) {
        if (this.topColor !== topColor && (topColor == null || !(topColor === this.topColor))) {
            var oldTopColor = this.topColor;
            this.topColor = topColor;
            this.propertyChangeSupport.firePropertyChange(/* name */ "TOP_COLOR", oldTopColor, topColor);
        }
    };
    /**
     * Returns the level which this wall belongs to.
     * @since 3.4
     * @return {Level}
     */
    Wall.prototype.getLevel = function () {
        return this.level;
    };
    /**
     * Sets the level of this wall. Once this wall is updated,
     * listeners added to this wall will receive a change notification.
     * @since 3.4
     * @param {Level} level
     */
    Wall.prototype.setLevel = function (level) {
        if (level !== this.level) {
            var oldLevel = this.level;
            this.level = level;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LEVEL", oldLevel, level);
        }
    };
    /**
     * Returns <code>true</code> if this wall is at the given <code>level</code>
     * or at a level with the same elevation and a smaller elevation index
     * or if the elevation of its highest point is higher than <code>level</code> elevation.
     * @since 3.4
     * @param {Level} level
     * @return {boolean}
     */
    Wall.prototype.isAtLevel = function (level) {
        if (this.level === level) {
            return true;
        }
        else if (this.level != null && level != null) {
            var wallLevelElevation = this.level.getElevation();
            var levelElevation = level.getElevation();
            return wallLevelElevation === levelElevation && this.level.getElevationIndex() < level.getElevationIndex() || wallLevelElevation < levelElevation && wallLevelElevation + this.getWallMaximumHeight() > levelElevation;
        }
        else {
            return false;
        }
    };
    /**
     * Returns the maximum height of the given wall.
     * @return {number}
     * @private
     */
    Wall.prototype.getWallMaximumHeight = function () {
        if (this.height == null) {
            return 0;
        }
        else if (this.isTrapezoidal()) {
            return Math.max(this.height, this.heightAtEnd);
        }
        else {
            return this.height;
        }
    };
    /**
     * Clears the points cache of this wall and of the walls attached to it.
     * @private
     */
    Wall.prototype.clearPointsCache = function () {
        this.pointsCache = null;
        this.pointsIncludingBaseboardsCache = null;
        if (this.wallAtStart != null) {
            this.wallAtStart.pointsCache = null;
            this.wallAtStart.pointsIncludingBaseboardsCache = null;
        }
        if (this.wallAtEnd != null) {
            this.wallAtEnd.pointsCache = null;
            this.wallAtEnd.pointsIncludingBaseboardsCache = null;
        }
    };
    /**
     * Returns the points of each corner of a wall not including its baseboards.
     * @return {Array} an array of the (x,y) coordinates of the wall corners.
     * For a straight wall, the points at index 0 and 3 indicates the start of the wall,
     * while the points at index 1 and 2 indicates the end of the wall.
     */
    Wall.prototype.getPoints$ = function () {
        return this.getPoints$boolean(false);
    };
    /**
     * Returns the points of each corner of a wall possibly including its baseboards.
     * @since 5.0
     * @param {boolean} includeBaseboards
     * @return {Array}
     */
    Wall.prototype.getPoints$boolean = function (includeBaseboards) {
        if (includeBaseboards && (this.leftSideBaseboard != null || this.rightSideBaseboard != null)) {
            if (this.pointsIncludingBaseboardsCache == null) {
                this.pointsIncludingBaseboardsCache = this.getShapePoints(true);
            }
            return this.clonePoints(this.pointsIncludingBaseboardsCache);
        }
        else {
            if (this.pointsCache == null) {
                this.pointsCache = this.getShapePoints(false);
            }
            return this.clonePoints(this.pointsCache);
        }
    };
    /**
     * Returns the points of each corner of a wall possibly including its baseboards.
     * @since 5.0
     * @param {boolean} includeBaseboards
     * @return {Array}
     */
    Wall.prototype.getPoints = function (includeBaseboards) {
        if (((typeof includeBaseboards === 'boolean') || includeBaseboards === null)) {
            return this.getPoints$boolean(includeBaseboards);
        }
        else if (includeBaseboards === undefined) {
            return this.getPoints$();
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Return a clone of the given <code>points</code> array.
     * @param {Array} points
     * @return {Array}
     * @private
     */
    Wall.prototype.clonePoints = function (points) {
        var clonedPoints = new Array(points.length);
        for (var i = 0; i < points.length; i++) {
            clonedPoints[i] = points[i].slice(0);
        }
        return clonedPoints;
    };
    /**
     * Returns the points of the wall possibly including baseboards thickness.
     * @param {boolean} includeBaseboards
     * @return {Array}
     * @private
     */
    Wall.prototype.getShapePoints = function (includeBaseboards) {
        var epsilon = 0.01;
        var wallPoints = this.getUnjoinedShapePoints(includeBaseboards);
        var leftSideStartPointIndex = 0;
        var rightSideStartPointIndex = wallPoints.length - 1;
        var leftSideEndPointIndex = (wallPoints.length / 2 | 0) - 1;
        var rightSideEndPointIndex = (wallPoints.length / 2 | 0);
        var limit = 2 * this.thickness;
        if (this.wallAtStart != null) {
            var wallAtStartPoints = this.wallAtStart.getUnjoinedShapePoints(includeBaseboards);
            var wallAtStartLeftSideStartPointIndex = 0;
            var wallAtStartRightSideStartPointIndex = wallAtStartPoints.length - 1;
            var wallAtStartLeftSideEndPointIndex = (wallAtStartPoints.length / 2 | 0) - 1;
            var wallAtStartRightSideEndPointIndex = (wallAtStartPoints.length / 2 | 0);
            var wallAtStartJoinedAtEnd = this.wallAtStart.getWallAtEnd() === this && (this.wallAtStart.getWallAtStart() !== this || (this.wallAtStart.xEnd === this.xStart && this.wallAtStart.yEnd === this.yStart));
            var wallAtStartJoinedAtStart = this.wallAtStart.getWallAtStart() === this && (this.wallAtStart.getWallAtEnd() !== this || (this.wallAtStart.xStart === this.xStart && this.wallAtStart.yStart === this.yStart));
            var wallAtStartPointsCache = includeBaseboards ? this.wallAtStart.pointsIncludingBaseboardsCache : this.wallAtStart.pointsCache;
            if (wallAtStartJoinedAtEnd) {
                this.computeIntersection(wallPoints[leftSideStartPointIndex], wallPoints[leftSideStartPointIndex + 1], wallAtStartPoints[wallAtStartLeftSideEndPointIndex], wallAtStartPoints[wallAtStartLeftSideEndPointIndex - 1], limit);
                this.computeIntersection(wallPoints[rightSideStartPointIndex], wallPoints[rightSideStartPointIndex - 1], wallAtStartPoints[wallAtStartRightSideEndPointIndex], wallAtStartPoints[wallAtStartRightSideEndPointIndex + 1], limit);
                if (wallAtStartPointsCache != null) {
                    if (Math.abs(wallPoints[leftSideStartPointIndex][0] - wallAtStartPointsCache[wallAtStartLeftSideEndPointIndex][0]) < epsilon && Math.abs(wallPoints[leftSideStartPointIndex][1] - wallAtStartPointsCache[wallAtStartLeftSideEndPointIndex][1]) < epsilon) {
                        wallPoints[leftSideStartPointIndex] = wallAtStartPointsCache[wallAtStartLeftSideEndPointIndex];
                    }
                    if (Math.abs(wallPoints[rightSideStartPointIndex][0] - wallAtStartPointsCache[wallAtStartRightSideEndPointIndex][0]) < epsilon && Math.abs(wallPoints[rightSideStartPointIndex][1] - wallAtStartPointsCache[wallAtStartRightSideEndPointIndex][1]) < epsilon) {
                        wallPoints[rightSideStartPointIndex] = wallAtStartPointsCache[wallAtStartRightSideEndPointIndex];
                    }
                }
            }
            else if (wallAtStartJoinedAtStart) {
                this.computeIntersection(wallPoints[leftSideStartPointIndex], wallPoints[leftSideStartPointIndex + 1], wallAtStartPoints[wallAtStartRightSideStartPointIndex], wallAtStartPoints[wallAtStartRightSideStartPointIndex - 1], limit);
                this.computeIntersection(wallPoints[rightSideStartPointIndex], wallPoints[rightSideStartPointIndex - 1], wallAtStartPoints[wallAtStartLeftSideStartPointIndex], wallAtStartPoints[wallAtStartLeftSideStartPointIndex + 1], limit);
                if (wallAtStartPointsCache != null) {
                    if (Math.abs(wallPoints[leftSideStartPointIndex][0] - wallAtStartPointsCache[wallAtStartRightSideStartPointIndex][0]) < epsilon && Math.abs(wallPoints[leftSideStartPointIndex][1] - wallAtStartPointsCache[wallAtStartRightSideStartPointIndex][1]) < epsilon) {
                        wallPoints[leftSideStartPointIndex] = wallAtStartPointsCache[wallAtStartRightSideStartPointIndex];
                    }
                    if (wallAtStartPointsCache != null && Math.abs(wallPoints[rightSideStartPointIndex][0] - wallAtStartPointsCache[wallAtStartLeftSideStartPointIndex][0]) < epsilon && Math.abs(wallPoints[rightSideStartPointIndex][1] - wallAtStartPointsCache[wallAtStartLeftSideStartPointIndex][1]) < epsilon) {
                        wallPoints[rightSideStartPointIndex] = wallAtStartPointsCache[wallAtStartLeftSideStartPointIndex];
                    }
                }
            }
        }
        if (this.wallAtEnd != null) {
            var wallAtEndPoints = this.wallAtEnd.getUnjoinedShapePoints(includeBaseboards);
            var wallAtEndLeftSideStartPointIndex = 0;
            var wallAtEndRightSideStartPointIndex = wallAtEndPoints.length - 1;
            var wallAtEndLeftSideEndPointIndex = (wallAtEndPoints.length / 2 | 0) - 1;
            var wallAtEndRightSideEndPointIndex = (wallAtEndPoints.length / 2 | 0);
            var wallAtEndJoinedAtStart = this.wallAtEnd.getWallAtStart() === this && (this.wallAtEnd.getWallAtEnd() !== this || (this.wallAtEnd.xStart === this.xEnd && this.wallAtEnd.yStart === this.yEnd));
            var wallAtEndJoinedAtEnd = this.wallAtEnd.getWallAtEnd() === this && (this.wallAtEnd.getWallAtStart() !== this || (this.wallAtEnd.xEnd === this.xEnd && this.wallAtEnd.yEnd === this.yEnd));
            var wallAtEndPointsCache = includeBaseboards ? this.wallAtEnd.pointsIncludingBaseboardsCache : this.wallAtEnd.pointsCache;
            if (wallAtEndJoinedAtStart) {
                this.computeIntersection(wallPoints[leftSideEndPointIndex], wallPoints[leftSideEndPointIndex - 1], wallAtEndPoints[wallAtEndLeftSideStartPointIndex], wallAtEndPoints[wallAtEndLeftSideStartPointIndex + 1], limit);
                this.computeIntersection(wallPoints[rightSideEndPointIndex], wallPoints[rightSideEndPointIndex + 1], wallAtEndPoints[wallAtEndRightSideStartPointIndex], wallAtEndPoints[wallAtEndRightSideStartPointIndex - 1], limit);
                if (wallAtEndPointsCache != null) {
                    if (Math.abs(wallPoints[leftSideEndPointIndex][0] - wallAtEndPointsCache[wallAtEndLeftSideStartPointIndex][0]) < epsilon && Math.abs(wallPoints[leftSideEndPointIndex][1] - wallAtEndPointsCache[wallAtEndLeftSideStartPointIndex][1]) < epsilon) {
                        wallPoints[leftSideEndPointIndex] = wallAtEndPointsCache[wallAtEndLeftSideStartPointIndex];
                    }
                    if (Math.abs(wallPoints[rightSideEndPointIndex][0] - wallAtEndPointsCache[wallAtEndRightSideStartPointIndex][0]) < epsilon && Math.abs(wallPoints[rightSideEndPointIndex][1] - wallAtEndPointsCache[wallAtEndRightSideStartPointIndex][1]) < epsilon) {
                        wallPoints[rightSideEndPointIndex] = wallAtEndPointsCache[wallAtEndRightSideStartPointIndex];
                    }
                }
            }
            else if (wallAtEndJoinedAtEnd) {
                this.computeIntersection(wallPoints[leftSideEndPointIndex], wallPoints[leftSideEndPointIndex - 1], wallAtEndPoints[wallAtEndRightSideEndPointIndex], wallAtEndPoints[wallAtEndRightSideEndPointIndex + 1], limit);
                this.computeIntersection(wallPoints[rightSideEndPointIndex], wallPoints[rightSideEndPointIndex + 1], wallAtEndPoints[wallAtEndLeftSideEndPointIndex], wallAtEndPoints[wallAtEndLeftSideEndPointIndex - 1], limit);
                if (wallAtEndPointsCache != null) {
                    if (Math.abs(wallPoints[leftSideEndPointIndex][0] - wallAtEndPointsCache[wallAtEndRightSideEndPointIndex][0]) < epsilon && Math.abs(wallPoints[leftSideEndPointIndex][1] - wallAtEndPointsCache[wallAtEndRightSideEndPointIndex][1]) < epsilon) {
                        wallPoints[leftSideEndPointIndex] = wallAtEndPointsCache[wallAtEndRightSideEndPointIndex];
                    }
                    if (Math.abs(wallPoints[rightSideEndPointIndex][0] - wallAtEndPointsCache[wallAtEndLeftSideEndPointIndex][0]) < epsilon && Math.abs(wallPoints[rightSideEndPointIndex][1] - wallAtEndPointsCache[wallAtEndLeftSideEndPointIndex][1]) < epsilon) {
                        wallPoints[rightSideEndPointIndex] = wallAtEndPointsCache[wallAtEndLeftSideEndPointIndex];
                    }
                }
            }
        }
        return wallPoints;
    };
    /**
     * Computes the rectangle or the circle arc of a wall according to its thickness
     * and possibly the thickness of its baseboards.
     * @param {boolean} includeBaseboards
     * @return {Array}
     * @private
     */
    Wall.prototype.getUnjoinedShapePoints = function (includeBaseboards) {
        if (this.arcExtent != null && this.arcExtent !== 0 && java.awt.geom.Point2D.distanceSq(this.xStart, this.yStart, this.xEnd, this.yEnd) > 1.0E-10) {
            var arcCircleCenter = this.getArcCircleCenter();
            var startAngle = (Math.fround ? (Math.atan2(arcCircleCenter[1] - this.yStart, arcCircleCenter[0] - this.xStart)) : Math.fround(Math.atan2(arcCircleCenter[1] - this.yStart, arcCircleCenter[0] - this.xStart)));
            startAngle += 2 * (Math.fround ? (Math.atan2(this.yStart - this.yEnd, this.xEnd - this.xStart)) : Math.fround(Math.atan2(this.yStart - this.yEnd, this.xEnd - this.xStart)));
            var arcCircleRadius = (Math.fround ? (java.awt.geom.Point2D.distance(arcCircleCenter[0], arcCircleCenter[1], this.xStart, this.yStart)) : Math.fround(java.awt.geom.Point2D.distance(arcCircleCenter[0], arcCircleCenter[1], this.xStart, this.yStart)));
            var exteriorArcRadius = arcCircleRadius + this.thickness / 2;
            var interiorArcRadius = Math.max(0, arcCircleRadius - this.thickness / 2);
            var exteriorArcLength = exteriorArcRadius * Math.abs(this.arcExtent);
            var angleDelta = this.arcExtent / (Math.fround ? (Math.sqrt(exteriorArcLength)) : Math.fround(Math.sqrt(exteriorArcLength)));
            var angleStepCount = ((this.arcExtent / angleDelta) | 0);
            if (includeBaseboards) {
                if (angleDelta > 0) {
                    if (this.leftSideBaseboard != null) {
                        exteriorArcRadius += this.leftSideBaseboard.getThickness();
                    }
                    if (this.rightSideBaseboard != null) {
                        interiorArcRadius -= this.rightSideBaseboard.getThickness();
                    }
                }
                else {
                    if (this.leftSideBaseboard != null) {
                        interiorArcRadius -= this.leftSideBaseboard.getThickness();
                    }
                    if (this.rightSideBaseboard != null) {
                        exteriorArcRadius += this.rightSideBaseboard.getThickness();
                    }
                }
            }
            var wallPoints = ([]);
            if (this.symmetric) {
                if (Math.abs(this.arcExtent - angleStepCount * angleDelta) > 1.0E-6) {
                    angleDelta = this.arcExtent / ++angleStepCount;
                }
                for (var i = 0; i <= angleStepCount; i++) {
                    this.computeRoundWallShapePoint(wallPoints, startAngle + this.arcExtent - i * angleDelta, i, angleDelta, arcCircleCenter, exteriorArcRadius, interiorArcRadius);
                }
            }
            else {
                var i = 0;
                for (var angle = this.arcExtent; angleDelta > 0 ? angle >= angleDelta * 0.1 : angle <= -angleDelta * 0.1; angle -= angleDelta, i++) {
                    this.computeRoundWallShapePoint(wallPoints, startAngle + angle, i, angleDelta, arcCircleCenter, exteriorArcRadius, interiorArcRadius);
                }
                this.computeRoundWallShapePoint(wallPoints, startAngle, i, angleDelta, arcCircleCenter, exteriorArcRadius, interiorArcRadius);
            }
            return wallPoints.slice(0);
        }
        else {
            var angle = Math.atan2(this.yEnd - this.yStart, this.xEnd - this.xStart);
            var sin = (Math.fround ? (Math.sin(angle)) : Math.fround(Math.sin(angle)));
            var cos = (Math.fround ? (Math.cos(angle)) : Math.fround(Math.cos(angle)));
            var leftSideTickness = this.thickness / 2;
            if (includeBaseboards && this.leftSideBaseboard != null) {
                leftSideTickness += this.leftSideBaseboard.getThickness();
            }
            var leftSideDx = sin * leftSideTickness;
            var leftSideDy = cos * leftSideTickness;
            var rightSideTickness = this.thickness / 2;
            if (includeBaseboards && this.rightSideBaseboard != null) {
                rightSideTickness += this.rightSideBaseboard.getThickness();
            }
            var rightSideDx = sin * rightSideTickness;
            var rightSideDy = cos * rightSideTickness;
            return [[this.xStart + leftSideDx, this.yStart - leftSideDy], [this.xEnd + leftSideDx, this.yEnd - leftSideDy], [this.xEnd - rightSideDx, this.yEnd + rightSideDy], [this.xStart - rightSideDx, this.yStart + rightSideDy]];
        }
    };
    /**
     * Computes the exterior and interior arc points of a round wall at the given <code>index</code>.
     * @param {Array} wallPoints
     * @param {number} angle
     * @param {number} index
     * @param {number} angleDelta
     * @param {Array} arcCircleCenter
     * @param {number} exteriorArcRadius
     * @param {number} interiorArcRadius
     * @private
     */
    Wall.prototype.computeRoundWallShapePoint = function (wallPoints, angle, index, angleDelta, arcCircleCenter, exteriorArcRadius, interiorArcRadius) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var interiorArcPoint = [(Math.fround ? ((arcCircleCenter[0] + interiorArcRadius * cos)) : Math.fround((arcCircleCenter[0] + interiorArcRadius * cos))), (Math.fround ? ((arcCircleCenter[1] - interiorArcRadius * sin)) : Math.fround((arcCircleCenter[1] - interiorArcRadius * sin)))];
        var exteriorArcPoint = [(Math.fround ? ((arcCircleCenter[0] + exteriorArcRadius * cos)) : Math.fround((arcCircleCenter[0] + exteriorArcRadius * cos))), (Math.fround ? ((arcCircleCenter[1] - exteriorArcRadius * sin)) : Math.fround((arcCircleCenter[1] - exteriorArcRadius * sin)))];
        if (angleDelta > 0) {
            /* add */ wallPoints.splice(index, 0, interiorArcPoint);
            /* add */ wallPoints.splice(/* size */ wallPoints.length - 1 - index, 0, exteriorArcPoint);
        }
        else {
            /* add */ wallPoints.splice(index, 0, exteriorArcPoint);
            /* add */ wallPoints.splice(/* size */ wallPoints.length - 1 - index, 0, interiorArcPoint);
        }
    };
    /**
     * Compute the intersection between the line that joins <code>point1</code> to <code>point2</code>
     * and the line that joins <code>point3</code> and <code>point4</code>, and stores the result
     * in <code>point1</code>.
     * @param {Array} point1
     * @param {Array} point2
     * @param {Array} point3
     * @param {Array} point4
     * @param {number} limit
     * @private
     */
    Wall.prototype.computeIntersection = function (point1, point2, point3, point4, limit) {
        var alpha1 = (point2[1] - point1[1]) / (point2[0] - point1[0]);
        var alpha2 = (point4[1] - point3[1]) / (point4[0] - point3[0]);
        if (alpha1 !== alpha2) {
            var x = point1[0];
            var y = point1[1];
            if (Math.abs(alpha1) > 4000) {
                if (Math.abs(alpha2) < 4000) {
                    x = point1[0];
                    var beta2 = point4[1] - alpha2 * point4[0];
                    y = alpha2 * x + beta2;
                }
            }
            else if (Math.abs(alpha2) > 4000) {
                if (Math.abs(alpha1) < 4000) {
                    x = point3[0];
                    var beta1 = point2[1] - alpha1 * point2[0];
                    y = alpha1 * x + beta1;
                }
            }
            else {
                var sameSignum = (function (f) { if (f > 0) {
                    return 1;
                }
                else if (f < 0) {
                    return -1;
                }
                else {
                    return 0;
                } })(alpha1) === (function (f) { if (f > 0) {
                    return 1;
                }
                else if (f < 0) {
                    return -1;
                }
                else {
                    return 0;
                } })(alpha2);
                if (Math.abs(alpha1 - alpha2) > 1.0E-5 && (!sameSignum || (Math.abs(alpha1) > Math.abs(alpha2) ? alpha1 / alpha2 : alpha2 / alpha1) > 1.004)) {
                    var beta1 = point2[1] - alpha1 * point2[0];
                    var beta2 = point4[1] - alpha2 * point4[0];
                    x = (beta2 - beta1) / (alpha1 - alpha2);
                    y = alpha1 * x + beta1;
                }
            }
            if (java.awt.geom.Point2D.distanceSq(x, y, point1[0], point1[1]) < limit * limit) {
                point1[0] = x;
                point1[1] = y;
            }
        }
    };
    /**
     * Returns <code>true</code> if this wall intersects
     * with the horizontal rectangle which opposite corners are at points
     * (<code>x0</code>, <code>y0</code>) and (<code>x1</code>, <code>y1</code>).
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {boolean}
     */
    Wall.prototype.intersectsRectangle = function (x0, y0, x1, y1) {
        var rectangle = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
        rectangle.add(x1, y1);
        return this.getShape(false).intersects(rectangle);
    };
    /**
     * Returns <code>true</code> if this wall contains the point at (<code>x</code>, <code>y</code>)
     * not including its baseboards, with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    Wall.prototype.containsPoint$float$float$float = function (x, y, margin) {
        return this.containsPoint$float$float$boolean$float(x, y, false, margin);
    };
    /**
     * Returns <code>true</code> if this wall contains the point at (<code>x</code>, <code>y</code>)
     * possibly including its baseboards, with a given <code>margin</code>.
     * @since 5.0
     * @param {number} x
     * @param {number} y
     * @param {boolean} includeBaseboards
     * @param {number} margin
     * @return {boolean}
     */
    Wall.prototype.containsPoint$float$float$boolean$float = function (x, y, includeBaseboards, margin) {
        return this.containsShapeAtWithMargin(this.getShape(includeBaseboards), x, y, margin);
    };
    /**
     * Returns <code>true</code> if this wall contains the point at (<code>x</code>, <code>y</code>)
     * possibly including its baseboards, with a given <code>margin</code>.
     * @since 5.0
     * @param {number} x
     * @param {number} y
     * @param {boolean} includeBaseboards
     * @param {number} margin
     * @return {boolean}
     */
    Wall.prototype.containsPoint = function (x, y, includeBaseboards, margin) {
        if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof includeBaseboards === 'boolean') || includeBaseboards === null) && ((typeof margin === 'number') || margin === null)) {
            return this.containsPoint$float$float$boolean$float(x, y, includeBaseboards, margin);
        }
        else if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof includeBaseboards === 'number') || includeBaseboards === null) && margin === undefined) {
            return this.containsPoint$float$float$float(x, y, includeBaseboards);
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Returns <code>true</code> if this wall start line contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code> around the wall start line.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    Wall.prototype.containsWallStartAt = function (x, y, margin) {
        var wallPoints = this.getPoints();
        var startLine = new java.awt.geom.Line2D.Float(wallPoints[0][0], wallPoints[0][1], wallPoints[wallPoints.length - 1][0], wallPoints[wallPoints.length - 1][1]);
        return this.containsShapeAtWithMargin(startLine, x, y, margin);
    };
    /**
     * Returns <code>true</code> if this wall end line contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code> around the wall end line.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    Wall.prototype.containsWallEndAt = function (x, y, margin) {
        var wallPoints = this.getPoints();
        var endLine = new java.awt.geom.Line2D.Float(wallPoints[(wallPoints.length / 2 | 0) - 1][0], wallPoints[(wallPoints.length / 2 | 0) - 1][1], wallPoints[(wallPoints.length / 2 | 0)][0], wallPoints[(wallPoints.length / 2 | 0)][1]);
        return this.containsShapeAtWithMargin(endLine, x, y, margin);
    };
    /**
     * Returns <code>true</code> if <code>shape</code> contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {java.awt.Shape} shape
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     * @private
     */
    Wall.prototype.containsShapeAtWithMargin = function (shape, x, y, margin) {
        if (margin === 0) {
            return shape.contains(x, y);
        }
        else {
            return shape.intersects(x - margin, y - margin, 2 * margin, 2 * margin);
        }
    };
    /**
     * Returns the shape matching this wall.
     * @param {boolean} includeBaseboards
     * @return {java.awt.Shape}
     * @private
     */
    Wall.prototype.getShape = function (includeBaseboards) {
        var wallPoints = this.getPoints$boolean(includeBaseboards);
        var wallPath = new java.awt.geom.GeneralPath();
        wallPath.moveTo(wallPoints[0][0], wallPoints[0][1]);
        for (var i = 1; i < wallPoints.length; i++) {
            wallPath.lineTo(wallPoints[i][0], wallPoints[i][1]);
        }
        wallPath.closePath();
        return wallPath;
    };
    /**
     * Returns a clone of the <code>walls</code> list. All existing walls
     * are copied and their wall at start and end point are set with copied
     * walls only if they belong to the returned list.
     * @param {Array} walls
     * @return {Array}
     */
    Wall.clone = function (walls) {
        var wallsCopy = ([]);
        for (var index177 = 0; index177 < walls.length; index177++) {
            var wall = walls[index177];
            {
                /* add */ wallsCopy.push(/* clone */ /* clone */ (function (o) { if (o.clone != undefined) {
                    return o.clone();
                }
                else {
                    var clone = Object.create(o);
                    for (var p in o) {
                        if (o.hasOwnProperty(p))
                            clone[p] = o[p];
                    }
                    return clone;
                } })(wall));
            }
        }
        for (var i = 0; i < walls.length; i++) {
            var wall = walls[i];
            var wallAtStartIndex = walls.indexOf(wall.getWallAtStart());
            if (wallAtStartIndex !== -1) {
                /* get */ wallsCopy[i].setWallAtStart(/* get */ wallsCopy[wallAtStartIndex]);
            }
            var wallAtEndIndex = walls.indexOf(wall.getWallAtEnd());
            if (wallAtEndIndex !== -1) {
                /* get */ wallsCopy[i].setWallAtEnd(/* get */ wallsCopy[wallAtEndIndex]);
            }
        }
        return wallsCopy;
    };
    /**
     * Moves this wall of (<code>dx</code>, <code>dy</code>) units.
     * @param {number} dx
     * @param {number} dy
     */
    Wall.prototype.move = function (dx, dy) {
        this.setXStart(this.getXStart() + dx);
        this.setYStart(this.getYStart() + dy);
        this.setXEnd(this.getXEnd() + dx);
        this.setYEnd(this.getYEnd() + dy);
    };
    /**
     * Returns a clone of this wall expected
     * its wall at start and wall at end aren't copied.
     * @return {Wall}
     */
    Wall.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_9 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_9[p] = o[p];
            }
            return clone_9;
        } })(this);
        clone.propertyChangeSupport = new PropertyChangeSupport(clone);
        clone.wallAtStart = null;
        clone.wallAtEnd = null;
        clone.level = null;
        clone.pointsCache = null;
        clone.pointsIncludingBaseboardsCache = null;
        return clone;
    };
    return Wall;
}(HomeObject));
Wall["__class"] = "Wall";
Wall["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "com.eteks.sweethome3d.model.Elevatable", "java.io.Serializable"];
/**
 * Creates a home piece of furniture from an existing piece.
 * @param {PieceOfFurniture} piece the piece from which data are copied
 * @class
 */
var HomePieceOfFurniture = (function (_super) {
    __extends(HomePieceOfFurniture, _super);
    function HomePieceOfFurniture(piece) {
        var _this = _super.call(this) || this;
        /*private*/ _this.propertyChangeSupport = new PropertyChangeSupport(_this);
        _this.catalogId = null;
        _this.name = null;
        _this.nameVisible = false;
        _this.nameXOffset = 0;
        _this.nameYOffset = 0;
        _this.nameStyle = null;
        _this.nameAngle = 0;
        _this.description = null;
        _this.information = null;
        _this.icon = null;
        _this.planIcon = null;
        _this.model = null;
        _this.width = 0;
        _this.depth = 0;
        _this.height = 0;
        _this.elevation = 0;
        _this.dropOnTopElevation = 0;
        _this.movable = false;
        _this.doorOrWindow = false;
        _this.modelMaterials = null;
        _this.color = null;
        _this.texture = null;
        _this.shininess = null;
        _this.modelRotation = null;
        _this.staircaseCutOutShape = null;
        _this.creator = null;
        _this.backFaceShown = false;
        _this.resizable = false;
        _this.deformable = false;
        _this.texturable = false;
        _this.price = null;
        _this.valueAddedTaxPercentage = null;
        _this.currency = null;
        _this.visible = false;
        _this.x = 0;
        _this.y = 0;
        _this.angle = 0;
        _this.modelMirrored = false;
        _this.level = null;
        _this.shapeCache = null;
        _this.name = piece.getName();
        _this.description = piece.getDescription();
        _this.information = piece.getInformation();
        _this.icon = piece.getIcon();
        _this.planIcon = piece.getPlanIcon();
        _this.model = piece.getModel();
        _this.width = piece.getWidth();
        _this.depth = piece.getDepth();
        _this.height = piece.getHeight();
        _this.elevation = piece.getElevation();
        _this.dropOnTopElevation = piece.getDropOnTopElevation();
        _this.movable = piece.isMovable();
        _this.doorOrWindow = piece.isDoorOrWindow();
        _this.color = piece.getColor();
        _this.modelRotation = piece.getModelRotation();
        _this.staircaseCutOutShape = piece.getStaircaseCutOutShape();
        _this.creator = piece.getCreator();
        _this.backFaceShown = piece.isBackFaceShown();
        _this.resizable = piece.isResizable();
        _this.deformable = piece.isDeformable();
        _this.texturable = piece.isTexturable();
        _this.price = piece.getPrice();
        _this.valueAddedTaxPercentage = piece.getValueAddedTaxPercentage();
        _this.currency = piece.getCurrency();
        if (piece != null && piece instanceof HomePieceOfFurniture) {
            var homePiece = piece;
            _this.catalogId = homePiece.getCatalogId();
            _this.nameVisible = homePiece.isNameVisible();
            _this.nameXOffset = homePiece.getNameXOffset();
            _this.nameYOffset = homePiece.getNameYOffset();
            _this.nameAngle = homePiece.getNameAngle();
            _this.nameStyle = homePiece.getNameStyle();
            _this.visible = homePiece.isVisible();
            _this.angle = homePiece.getAngle();
            _this.x = homePiece.getX();
            _this.y = homePiece.getY();
            _this.modelMirrored = homePiece.isModelMirrored();
            _this.texture = homePiece.getTexture();
            _this.shininess = homePiece.getShininess();
            _this.modelMaterials = homePiece.getModelMaterials();
        }
        else {
            if (piece != null && piece instanceof CatalogPieceOfFurniture) {
                _this.catalogId = piece.getId();
            }
            _this.visible = true;
            _this.x = _this.width / 2;
            _this.y = _this.depth / 2;
        }
        return _this;
    }
    HomePieceOfFurniture.__static_initialize = function () { if (!HomePieceOfFurniture.__static_initialized) {
        HomePieceOfFurniture.__static_initialized = true;
        HomePieceOfFurniture.__static_initializer_0();
    } };
    HomePieceOfFurniture.TWICE_PI_$LI$ = function () { HomePieceOfFurniture.__static_initialize(); if (HomePieceOfFurniture.TWICE_PI == null)
        HomePieceOfFurniture.TWICE_PI = 2 * Math.PI; return HomePieceOfFurniture.TWICE_PI; };
    ;
    HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$ = function () { HomePieceOfFurniture.__static_initialize(); return HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS; };
    ;
    HomePieceOfFurniture.IDENTITY_$LI$ = function () { HomePieceOfFurniture.__static_initialize(); if (HomePieceOfFurniture.IDENTITY == null)
        HomePieceOfFurniture.IDENTITY = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; return HomePieceOfFurniture.IDENTITY; };
    ;
    HomePieceOfFurniture.__static_initializer_0 = function () {
        var collator = (function (o1, o2) { return o1.toString().localeCompare(o2.toString()); });
        HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS = ({});
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "CATALOG_ID", new HomePieceOfFurniture.HomePieceOfFurniture$0(collator));
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "NAME", new HomePieceOfFurniture.HomePieceOfFurniture$1(collator));
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "WIDTH", new HomePieceOfFurniture.HomePieceOfFurniture$2());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "HEIGHT", new HomePieceOfFurniture.HomePieceOfFurniture$3());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "DEPTH", new HomePieceOfFurniture.HomePieceOfFurniture$4());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "MOVABLE", new HomePieceOfFurniture.HomePieceOfFurniture$5());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "DOOR_OR_WINDOW", new HomePieceOfFurniture.HomePieceOfFurniture$6());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "COLOR", new HomePieceOfFurniture.HomePieceOfFurniture$7());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "TEXTURE", new HomePieceOfFurniture.HomePieceOfFurniture$8(collator));
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "VISIBLE", new HomePieceOfFurniture.HomePieceOfFurniture$9());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "X", new HomePieceOfFurniture.HomePieceOfFurniture$10());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "Y", new HomePieceOfFurniture.HomePieceOfFurniture$11());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "ELEVATION", new HomePieceOfFurniture.HomePieceOfFurniture$12());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "ANGLE", new HomePieceOfFurniture.HomePieceOfFurniture$13());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "LEVEL", new HomePieceOfFurniture.HomePieceOfFurniture$14());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "PRICE", new HomePieceOfFurniture.HomePieceOfFurniture$15());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "VALUE_ADDED_TAX_PERCENTAGE", new HomePieceOfFurniture.HomePieceOfFurniture$16());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "VALUE_ADDED_TAX", new HomePieceOfFurniture.HomePieceOfFurniture$17());
        /* put */ (function (m, k, v) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                m.entries[i].value = v;
                return;
            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), "PRICE_VALUE_ADDED_TAX_INCLUDED", new HomePieceOfFurniture.HomePieceOfFurniture$18());
    };
    HomePieceOfFurniture.compare$float$float = function (value1, value2) {
        return (value1 - value2);
    };
    HomePieceOfFurniture.compare$boolean$boolean = function (value1, value2) {
        return value1 === value2 ? 0 : (value1 ? -1 : 1);
    };
    HomePieceOfFurniture.compare$java_math_BigDecimal$java_math_BigDecimal = function (value1, value2) {
        if (value1 === value2) {
            return 0;
        }
        else if (value1 == null) {
            return -1;
        }
        else if (value2 == null) {
            return 1;
        }
        else {
            return value1.cmp(value2);
        }
    };
    HomePieceOfFurniture.compare = function (value1, value2) {
        if (((value1 != null && value1 instanceof Big) || value1 === null) && ((value2 != null && value2 instanceof Big) || value2 === null)) {
            return HomePieceOfFurniture.compare$java_math_BigDecimal$java_math_BigDecimal(value1, value2);
        }
        else if (((value1 != null && value1 instanceof Level) || value1 === null) && ((value2 != null && value2 instanceof Level) || value2 === null)) {
            return HomePieceOfFurniture.compare$com_eteks_sweethome3d_model_Level$com_eteks_sweethome3d_model_Level(value1, value2);
        }
        else if (((typeof value1 === 'number') || value1 === null) && ((typeof value2 === 'number') || value2 === null)) {
            return HomePieceOfFurniture.compare$float$float(value1, value2);
        }
        else if (((typeof value1 === 'boolean') || value1 === null) && ((typeof value2 === 'boolean') || value2 === null)) {
            return HomePieceOfFurniture.compare$boolean$boolean(value1, value2);
        }
        else
            throw new Error('invalid overload');
    };
    HomePieceOfFurniture.compare$com_eteks_sweethome3d_model_Level$com_eteks_sweethome3d_model_Level = function (level1, level2) {
        if (level1 === level2) {
            return 0;
        }
        else if (level1 == null) {
            return -1;
        }
        else if (level2 == null) {
            return 1;
        }
        else {
            return (level1.getElevation() - level2.getElevation());
        }
    };
    /**
     * Adds the property change <code>listener</code> in parameter to this piece.
     * @param {PropertyChangeListener} listener
     */
    HomePieceOfFurniture.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this piece.
     * @param {PropertyChangeListener} listener
     */
    HomePieceOfFurniture.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
    };
    /**
     * Returns the catalog ID of this piece of furniture or <code>null</code> if it doesn't exist.
     * @return {string}
     */
    HomePieceOfFurniture.prototype.getCatalogId = function () {
        return this.catalogId;
    };
    /**
     * Returns the name of this piece of furniture.
     * @return {string}
     */
    HomePieceOfFurniture.prototype.getName = function () {
        return this.name;
    };
    /**
     * Sets the name of this piece of furniture. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @param {string} name
     */
    HomePieceOfFurniture.prototype.setName = function (name) {
        if (name !== this.name && (name == null || !(name === this.name))) {
            var oldName = this.name;
            this.name = name;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME", oldName, name);
        }
    };
    /**
     * Returns whether the name of this piece should be drawn or not.
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isNameVisible = function () {
        return this.nameVisible;
    };
    /**
     * Sets whether the name of this piece is visible or not. Once this piece of furniture
     * is updated, listeners added to this piece will receive a change notification.
     * @param {boolean} nameVisible
     */
    HomePieceOfFurniture.prototype.setNameVisible = function (nameVisible) {
        if (nameVisible !== this.nameVisible) {
            this.nameVisible = nameVisible;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME_VISIBLE", !nameVisible, nameVisible);
        }
    };
    /**
     * Returns the distance along x axis applied to piece abscissa to display piece name.
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getNameXOffset = function () {
        return this.nameXOffset;
    };
    /**
     * Sets the distance along x axis applied to piece abscissa to display piece name.
     * Once this piece is updated, listeners added to this piece will receive a change notification.
     * @param {number} nameXOffset
     */
    HomePieceOfFurniture.prototype.setNameXOffset = function (nameXOffset) {
        if (nameXOffset !== this.nameXOffset) {
            var oldNameXOffset = this.nameXOffset;
            this.nameXOffset = nameXOffset;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME_X_OFFSET", oldNameXOffset, nameXOffset);
        }
    };
    /**
     * Returns the distance along y axis applied to piece ordinate
     * to display piece name.
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getNameYOffset = function () {
        return this.nameYOffset;
    };
    /**
     * Sets the distance along y axis applied to piece ordinate to display piece name.
     * Once this piece is updated, listeners added to this piece will receive a change notification.
     * @param {number} nameYOffset
     */
    HomePieceOfFurniture.prototype.setNameYOffset = function (nameYOffset) {
        if (nameYOffset !== this.nameYOffset) {
            var oldNameYOffset = this.nameYOffset;
            this.nameYOffset = nameYOffset;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME_Y_OFFSET", oldNameYOffset, nameYOffset);
        }
    };
    /**
     * Returns the text style used to display piece name.
     * @return {TextStyle}
     */
    HomePieceOfFurniture.prototype.getNameStyle = function () {
        return this.nameStyle;
    };
    /**
     * Sets the text style used to display piece name.
     * Once this piece is updated, listeners added to this piece will receive a change notification.
     * @param {TextStyle} nameStyle
     */
    HomePieceOfFurniture.prototype.setNameStyle = function (nameStyle) {
        if (nameStyle !== this.nameStyle) {
            var oldNameStyle = this.nameStyle;
            this.nameStyle = nameStyle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME_STYLE", oldNameStyle, nameStyle);
        }
    };
    /**
     * Returns the angle in radians used to display the piece name.
     * @since 3.6
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getNameAngle = function () {
        return this.nameAngle;
    };
    /**
     * Sets the angle in radians used to display the piece name. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @since 3.6
     * @param {number} nameAngle
     */
    HomePieceOfFurniture.prototype.setNameAngle = function (nameAngle) {
        nameAngle = (Math.fround ? (((nameAngle % HomePieceOfFurniture.TWICE_PI_$LI$() + HomePieceOfFurniture.TWICE_PI_$LI$()) % HomePieceOfFurniture.TWICE_PI_$LI$())) : Math.fround(((nameAngle % HomePieceOfFurniture.TWICE_PI_$LI$() + HomePieceOfFurniture.TWICE_PI_$LI$()) % HomePieceOfFurniture.TWICE_PI_$LI$())));
        if (nameAngle !== this.nameAngle) {
            var oldNameAngle = this.nameAngle;
            this.nameAngle = nameAngle;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME_ANGLE", oldNameAngle, nameAngle);
        }
    };
    /**
     * Returns the description of this piece of furniture.
     * The returned value may be <code>null</code>.
     * @return {string}
     */
    HomePieceOfFurniture.prototype.getDescription = function () {
        return this.description;
    };
    /**
     * Sets the description of this piece of furniture. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @param {string} description
     */
    HomePieceOfFurniture.prototype.setDescription = function (description) {
        if (description !== this.description && (description == null || !(description === this.description))) {
            var oldDescription = this.description;
            this.description = description;
            this.propertyChangeSupport.firePropertyChange(/* name */ "DESCRIPTION", oldDescription, description);
        }
    };
    /**
     * Returns the additional information associated to this piece, or <code>null</code>.
     * @since 4.2
     * @return {string}
     */
    HomePieceOfFurniture.prototype.getInformation = function () {
        return this.information;
    };
    /**
     * Returns the depth of this piece of furniture.
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getDepth = function () {
        return this.depth;
    };
    /**
     * Sets the depth of this piece of furniture. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @throws IllegalStateException if this piece of furniture isn't resizable
     * @param {number} depth
     */
    HomePieceOfFurniture.prototype.setDepth = function (depth) {
        if (this.isResizable()) {
            if (depth !== this.depth) {
                var oldDepth = this.depth;
                this.depth = depth;
                this.shapeCache = null;
                this.propertyChangeSupport.firePropertyChange(/* name */ "DEPTH", oldDepth, depth);
            }
        }
        else {
            throw new IllegalStateException("Piece isn\'t resizable");
        }
    };
    /**
     * Returns the height of this piece of furniture.
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getHeight = function () {
        return this.height;
    };
    /**
     * Sets the height of this piece of furniture. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @throws IllegalStateException if this piece of furniture isn't resizable
     * @param {number} height
     */
    HomePieceOfFurniture.prototype.setHeight = function (height) {
        if (this.isResizable()) {
            if (height !== this.height) {
                var oldHeight = this.height;
                this.height = height;
                this.propertyChangeSupport.firePropertyChange(/* name */ "HEIGHT", oldHeight, height);
            }
        }
        else {
            throw new IllegalStateException("Piece isn\'t resizable");
        }
    };
    /**
     * Returns the width of this piece of furniture.
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getWidth = function () {
        return this.width;
    };
    /**
     * Sets the width of this piece of furniture. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @throws IllegalStateException if this piece of furniture isn't resizable
     * @param {number} width
     */
    HomePieceOfFurniture.prototype.setWidth = function (width) {
        if (this.isResizable()) {
            if (width !== this.width) {
                var oldWidth = this.width;
                this.width = width;
                this.shapeCache = null;
                this.propertyChangeSupport.firePropertyChange(/* name */ "WIDTH", oldWidth, width);
            }
        }
        else {
            throw new IllegalStateException("Piece isn\'t resizable");
        }
    };
    /**
     * Returns the elevation of the bottom of this piece of furniture on its level.
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getElevation = function () {
        return this.elevation;
    };
    /**
     * Returns the elevation at which should be placed an object dropped on this piece.
     * @return {number} a percentage of the height of this piece. A negative value means that the piece
     * should be ignored when an object is dropped on it.
     * @since 4.4
     */
    HomePieceOfFurniture.prototype.getDropOnTopElevation = function () {
        return this.dropOnTopElevation;
    };
    /**
     * Returns the elevation of the bottom of this piece of furniture
     * from the ground according to the elevation of its level.
     * @since 3.4
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getGroundElevation = function () {
        if (this.level != null) {
            return this.elevation + this.level.getElevation();
        }
        else {
            return this.elevation;
        }
    };
    /**
     * Sets the elevation of this piece of furniture on its level. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @param {number} elevation
     */
    HomePieceOfFurniture.prototype.setElevation = function (elevation) {
        if (elevation !== this.elevation) {
            var oldElevation = this.elevation;
            this.elevation = elevation;
            this.propertyChangeSupport.firePropertyChange(/* name */ "ELEVATION", oldElevation, elevation);
        }
    };
    /**
     * Returns <code>true</code> if this piece of furniture is movable.
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isMovable = function () {
        return this.movable;
    };
    /**
     * Sets whether this piece is movable or not.
     * @since 3.0
     * @param {boolean} movable
     */
    HomePieceOfFurniture.prototype.setMovable = function (movable) {
        if (movable !== this.movable) {
            this.movable = movable;
            this.propertyChangeSupport.firePropertyChange(/* name */ "MOVABLE", !movable, movable);
        }
    };
    /**
     * Returns <code>true</code> if this piece of furniture is a door or a window.
     * As this method existed before {@linkplain HomeDoorOrWindow HomeDoorOrWindow} class,
     * you shouldn't rely on the value returned by this method to guess if a piece
     * is an instance of <code>DoorOrWindow</code> class.
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isDoorOrWindow = function () {
        return this.doorOrWindow;
    };
    /**
     * Returns the icon of this piece of furniture.
     * @return {Content}
     */
    HomePieceOfFurniture.prototype.getIcon = function () {
        return this.icon;
    };
    /**
     * Returns the icon of this piece of furniture displayed in plan or <code>null</code>.
     * @since 2.2
     * @return {Content}
     */
    HomePieceOfFurniture.prototype.getPlanIcon = function () {
        return this.planIcon;
    };
    /**
     * Returns the 3D model of this piece of furniture.
     * @return {Content}
     */
    HomePieceOfFurniture.prototype.getModel = function () {
        return this.model;
    };
    /**
     * Sets the materials of the 3D model of this piece of furniture.
     * Once this piece is updated, listeners added to this piece will receive a change notification.
     * @param {Array} modelMaterials the materials of the 3D model or <code>null</code> if they shouldn't be changed
     * @throws IllegalStateException if this piece of furniture isn't texturable
     */
    HomePieceOfFurniture.prototype.setModelMaterials = function (modelMaterials) {
        if (this.isTexturable()) {
            if (!(function (a1, a2) { if (a1 == null && a2 == null)
                return true; if (a1 == null || a2 == null)
                return false; if (a1.length != a2.length)
                return false; for (var i = 0; i < a1.length; i++) {
                if (a1[i] != a2[i])
                    return false;
            } return true; })(modelMaterials, this.modelMaterials)) {
                var oldModelMaterials = this.modelMaterials;
                this.modelMaterials = modelMaterials != null ? modelMaterials.slice(0) : null;
                this.propertyChangeSupport.firePropertyChange(/* name */ "MODEL_MATERIALS", oldModelMaterials, modelMaterials);
            }
        }
        else {
            throw new IllegalStateException("Piece isn\'t texturable");
        }
    };
    /**
     * Returns the materials applied to the 3D model of this piece of furniture.
     * @return {Array} the materials of the 3D model or <code>null</code>
     * if the individual materials of the 3D model are not modified.
     * @since 4.0
     */
    HomePieceOfFurniture.prototype.getModelMaterials = function () {
        if (this.modelMaterials != null) {
            return this.modelMaterials.slice(0);
        }
        else {
            return null;
        }
    };
    /**
     * Returns the color of this piece of furniture.
     * @return {number} the color of the piece as RGB code or <code>null</code> if piece color is unchanged.
     */
    HomePieceOfFurniture.prototype.getColor = function () {
        return this.color;
    };
    /**
     * Sets the color of this piece of furniture.
     * Once this piece is updated, listeners added to this piece will receive a change notification.
     * @param {number} color the color of this piece of furniture or <code>null</code> if piece color is the default one
     * @throws IllegalStateException if this piece of furniture isn't texturable
     */
    HomePieceOfFurniture.prototype.setColor = function (color) {
        if (this.isTexturable()) {
            if (color !== this.color && (color == null || !(color === this.color))) {
                var oldColor = this.color;
                this.color = color;
                this.propertyChangeSupport.firePropertyChange(/* name */ "COLOR", oldColor, color);
            }
        }
        else {
            throw new IllegalStateException("Piece isn\'t texturable");
        }
    };
    /**
     * Returns the texture of this piece of furniture.
     * @return {HomeTexture} the texture of the piece or <code>null</code> if piece texture is unchanged.
     * @since 2.3
     */
    HomePieceOfFurniture.prototype.getTexture = function () {
        return this.texture;
    };
    /**
     * Sets the texture of this piece of furniture.
     * Once this piece is updated, listeners added to this piece will receive a change notification.
     * @param {HomeTexture} texture the texture of this piece of furniture or <code>null</code> if piece texture is the default one
     * @throws IllegalStateException if this piece of furniture isn't texturable
     * @since 2.3
     */
    HomePieceOfFurniture.prototype.setTexture = function (texture) {
        if (this.isTexturable()) {
            if (texture !== this.texture && (texture == null || !(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(texture, this.texture))) {
                var oldTexture = this.texture;
                this.texture = texture;
                this.propertyChangeSupport.firePropertyChange(/* name */ "TEXTURE", oldTexture, texture);
            }
        }
        else {
            throw new IllegalStateException("Piece isn\'t texturable");
        }
    };
    /**
     * Returns the shininess of this piece of furniture.
     * @return {number} a value between 0 (matt) and 1 (very shiny) or <code>null</code> if piece shininess is unchanged.
     * @since 3.0
     */
    HomePieceOfFurniture.prototype.getShininess = function () {
        return this.shininess;
    };
    /**
     * Sets the shininess of this piece of furniture or <code>null</code> if piece shininess is unchanged.
     * Once this piece is updated, listeners added to this piece will receive a change notification.
     * @throws IllegalStateException if this piece of furniture isn't texturable
     * @since 3.0
     * @param {number} shininess
     */
    HomePieceOfFurniture.prototype.setShininess = function (shininess) {
        if (this.isTexturable()) {
            if (shininess !== this.shininess && (shininess == null || !(shininess === this.shininess))) {
                var oldShininess = this.shininess;
                this.shininess = shininess;
                this.propertyChangeSupport.firePropertyChange(/* name */ "SHININESS", oldShininess, shininess);
            }
        }
        else {
            throw new IllegalStateException("Piece isn\'t texturable");
        }
    };
    /**
     * Returns <code>true</code> if this piece is resizable.
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isResizable = function () {
        return this.resizable;
    };
    /**
     * Returns <code>true</code> if this piece is deformable.
     * @since 3.0
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isDeformable = function () {
        return this.deformable;
    };
    /**
     * Returns <code>false</code> if this piece should always keep the same color or texture.
     * @since 3.0
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isTexturable = function () {
        return this.texturable;
    };
    /**
     * Returns the price of this piece of furniture or <code>null</code>.
     * @return {Big}
     */
    HomePieceOfFurniture.prototype.getPrice = function () {
        return this.price;
    };
    /**
     * Sets the price of this piece of furniture. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @since 4.0
     * @param {Big} price
     */
    HomePieceOfFurniture.prototype.setPrice = function (price) {
        if (price !== this.price && (price == null || !(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(price, this.price))) {
            var oldPrice = this.price;
            this.price = price;
            this.propertyChangeSupport.firePropertyChange(/* name */ "PRICE", oldPrice, price);
        }
    };
    /**
     * Returns the Value Added Tax percentage applied to the price of this piece of furniture.
     * @return {Big}
     */
    HomePieceOfFurniture.prototype.getValueAddedTaxPercentage = function () {
        return this.valueAddedTaxPercentage;
    };
    /**
     * Returns the Value Added Tax applied to the price of this piece of furniture.
     * @return {Big}
     */
    HomePieceOfFurniture.prototype.getValueAddedTax = function () {
        if (this.price != null && this.valueAddedTaxPercentage != null) {
            return this.price.times(this.valueAddedTaxPercentage).round(/* scale */ 2);
        }
        else {
            return null;
        }
    };
    /**
     * Returns the price of this piece of furniture, Value Added Tax included.
     * @return {Big}
     */
    HomePieceOfFurniture.prototype.getPriceValueAddedTaxIncluded = function () {
        if (this.price != null && this.valueAddedTaxPercentage != null) {
            return this.price.plus(this.getValueAddedTax());
        }
        else {
            return this.price;
        }
    };
    /**
     * Returns the price currency, noted with ISO 4217 code, or <code>null</code>
     * if it has no price or default currency should be used.
     * @since 3.4
     * @return {string}
     */
    HomePieceOfFurniture.prototype.getCurrency = function () {
        return this.currency;
    };
    /**
     * Returns <code>true</code> if this piece of furniture is visible.
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isVisible = function () {
        return this.visible;
    };
    /**
     * Sets whether this piece of furniture is visible or not. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @param {boolean} visible
     */
    HomePieceOfFurniture.prototype.setVisible = function (visible) {
        if (visible !== this.visible) {
            this.visible = visible;
            this.propertyChangeSupport.firePropertyChange(/* name */ "VISIBLE", !visible, visible);
        }
    };
    /**
     * Returns the abscissa of the center of this piece of furniture.
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getX = function () {
        return this.x;
    };
    /**
     * Sets the abscissa of the center of this piece. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @param {number} x
     */
    HomePieceOfFurniture.prototype.setX = function (x) {
        if (x !== this.x) {
            var oldX = this.x;
            this.x = x;
            this.shapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "X", oldX, x);
        }
    };
    /**
     * Returns the ordinate of the center of this piece of furniture.
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getY = function () {
        return this.y;
    };
    /**
     * Sets the ordinate of the center of this piece. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @param {number} y
     */
    HomePieceOfFurniture.prototype.setY = function (y) {
        if (y !== this.y) {
            var oldY = this.y;
            this.y = y;
            this.shapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "Y", oldY, y);
        }
    };
    /**
     * Returns the angle in radians of this piece of furniture around vertical axis.
     * @return {number}
     */
    HomePieceOfFurniture.prototype.getAngle = function () {
        return this.angle;
    };
    /**
     * Sets the angle of this piece around vertical axis. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @param {number} angle
     */
    HomePieceOfFurniture.prototype.setAngle = function (angle) {
        angle = (Math.fround ? (((angle % HomePieceOfFurniture.TWICE_PI_$LI$() + HomePieceOfFurniture.TWICE_PI_$LI$()) % HomePieceOfFurniture.TWICE_PI_$LI$())) : Math.fround(((angle % HomePieceOfFurniture.TWICE_PI_$LI$() + HomePieceOfFurniture.TWICE_PI_$LI$()) % HomePieceOfFurniture.TWICE_PI_$LI$())));
        if (angle !== this.angle) {
            var oldAngle = this.angle;
            this.angle = angle;
            this.shapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "ANGLE", oldAngle, angle);
        }
    };
    /**
     * Returns <code>true</code> if the model of this piece should be mirrored.
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isModelMirrored = function () {
        return this.modelMirrored;
    };
    /**
     * Sets whether the model of this piece of furniture is mirrored or not. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @throws IllegalStateException if this piece of furniture isn't resizable
     * @param {boolean} modelMirrored
     */
    HomePieceOfFurniture.prototype.setModelMirrored = function (modelMirrored) {
        if (this.isResizable()) {
            if (modelMirrored !== this.modelMirrored) {
                this.modelMirrored = modelMirrored;
                this.propertyChangeSupport.firePropertyChange(/* name */ "MODEL_MIRRORED", !modelMirrored, modelMirrored);
            }
        }
        else {
            throw new IllegalStateException("Piece isn\'t resizable");
        }
    };
    /**
     * Returns the rotation 3 by 3 matrix of this piece of furniture that ensures
     * its model is correctly oriented.
     * @return {Array}
     */
    HomePieceOfFurniture.prototype.getModelRotation = function () {
        return [[this.modelRotation[0][0], this.modelRotation[0][1], this.modelRotation[0][2]], [this.modelRotation[1][0], this.modelRotation[1][1], this.modelRotation[1][2]], [this.modelRotation[2][0], this.modelRotation[2][1], this.modelRotation[2][2]]];
    };
    /**
     * Returns the shape used to cut out upper levels when they intersect with the piece
     * like a staircase.
     * @since 3.4
     * @return {string}
     */
    HomePieceOfFurniture.prototype.getStaircaseCutOutShape = function () {
        return this.staircaseCutOutShape;
    };
    /**
     * Returns the creator of this piece.
     * @since 4.2
     * @return {string}
     */
    HomePieceOfFurniture.prototype.getCreator = function () {
        return this.creator;
    };
    /**
     * Returns <code>true</code> if the back face of the piece of furniture
     * model should be displayed.
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isBackFaceShown = function () {
        return this.backFaceShown;
    };
    /**
     * Returns the level which this piece belongs to.
     * @since 3.4
     * @return {Level}
     */
    HomePieceOfFurniture.prototype.getLevel = function () {
        return this.level;
    };
    /**
     * Sets the level of this piece of furniture. Once this piece is updated,
     * listeners added to this piece will receive a change notification.
     * @since 3.4
     * @param {Level} level
     */
    HomePieceOfFurniture.prototype.setLevel = function (level) {
        if (level !== this.level) {
            var oldLevel = this.level;
            this.level = level;
            this.propertyChangeSupport.firePropertyChange(/* name */ "LEVEL", oldLevel, level);
        }
    };
    /**
     * Returns <code>true</code> if this piece is at the given <code>level</code>
     * or at a level with the same elevation and a smaller elevation index
     * or if the elevation of its highest point is higher than <code>level</code> elevation.
     * @since 3.4
     * @param {Level} level
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isAtLevel = function (level) {
        if (this.level === level) {
            return true;
        }
        else if (this.level != null && level != null) {
            var pieceLevelElevation = this.level.getElevation();
            var levelElevation = level.getElevation();
            return pieceLevelElevation === levelElevation && this.level.getElevationIndex() < level.getElevationIndex() || pieceLevelElevation < levelElevation && this.isTopAtLevel(level);
        }
        else {
            return false;
        }
    };
    /**
     * Returns <code>true</code> if the top of this piece is visible at the given level.
     * @param {Level} level
     * @return {boolean}
     * @private
     */
    HomePieceOfFurniture.prototype.isTopAtLevel = function (level) {
        var topElevation = this.level.getElevation() + this.elevation + this.height;
        if (this.staircaseCutOutShape != null) {
            return topElevation >= level.getElevation();
        }
        else {
            return topElevation > level.getElevation();
        }
    };
    HomePieceOfFurniture.prototype.getPoints = function (includeBaseboards) {
        if (includeBaseboards === undefined) {
            return this.getPoints$();
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Returns the points of each corner of a piece.
     * @return {Array} an array of the 4 (x,y) coordinates of the piece corners.
     */
    HomePieceOfFurniture.prototype.getPoints$ = function () {
        var piecePoints = (function (dims) { var allocate = function (dims) { if (dims.length == 0) {
            return 0;
        }
        else {
            var array = [];
            for (var i = 0; i < dims[0]; i++) {
                array.push(allocate(dims.slice(1)));
            }
            return array;
        } }; return allocate(dims); })([4, 2]);
        var it = this.getShape().getPathIterator(null);
        for (var i = 0; i < piecePoints.length; i++) {
            it.currentSegment(piecePoints[i]);
            it.next();
        }
        return piecePoints;
    };
    /**
     * Returns <code>true</code> if this piece intersects
     * with the horizontal rectangle which opposite corners are at points
     * (<code>x0</code>, <code>y0</code>) and (<code>x1</code>, <code>y1</code>).
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.intersectsRectangle = function (x0, y0, x1, y1) {
        var rectangle = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
        rectangle.add(x1, y1);
        return this.getShape().intersects(rectangle);
    };
    HomePieceOfFurniture.prototype.containsPoint = function (x, y, includeBaseboards, margin) {
        if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof includeBaseboards === 'number') || includeBaseboards === null) && margin === undefined) {
            return this.containsPoint$float$float$float(x, y, includeBaseboards);
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Returns <code>true</code> if this piece contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.containsPoint$float$float$float = function (x, y, margin) {
        if (margin === 0) {
            return this.getShape().contains(x, y);
        }
        else {
            return this.getShape().intersects(x - margin, y - margin, 2 * margin, 2 * margin);
        }
    };
    /**
     * Returns <code>true</code> if one of the corner of this piece is
     * the point at (<code>x</code>, <code>y</code>) with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isPointAt = function (x, y, margin) {
        {
            var array179 = this.getPoints();
            for (var index178 = 0; index178 < array179.length; index178++) {
                var point = array179[index178];
                {
                    if (Math.abs(x - point[0]) <= margin && Math.abs(y - point[1]) <= margin) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    /**
     * Returns <code>true</code> if the top left point of this piece is
     * the point at (<code>x</code>, <code>y</code>) with a given <code>margin</code>,
     * and if that point is closer to top left point than to top right and bottom left points.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isTopLeftPointAt = function (x, y, margin) {
        var points = this.getPoints();
        var distanceSquareToTopLeftPoint = java.awt.geom.Point2D.distanceSq(x, y, points[0][0], points[0][1]);
        return distanceSquareToTopLeftPoint <= margin * margin && distanceSquareToTopLeftPoint < java.awt.geom.Point2D.distanceSq(x, y, points[1][0], points[1][1]) && distanceSquareToTopLeftPoint < java.awt.geom.Point2D.distanceSq(x, y, points[3][0], points[3][1]);
    };
    /**
     * Returns <code>true</code> if the top right point of this piece is
     * the point at (<code>x</code>, <code>y</code>) with a given <code>margin</code>,
     * and if that point is closer to top right point than to top left and bottom right points.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isTopRightPointAt = function (x, y, margin) {
        var points = this.getPoints();
        var distanceSquareToTopRightPoint = java.awt.geom.Point2D.distanceSq(x, y, points[1][0], points[1][1]);
        return distanceSquareToTopRightPoint <= margin * margin && distanceSquareToTopRightPoint < java.awt.geom.Point2D.distanceSq(x, y, points[0][0], points[0][1]) && distanceSquareToTopRightPoint < java.awt.geom.Point2D.distanceSq(x, y, points[2][0], points[2][1]);
    };
    /**
     * Returns <code>true</code> if the bottom left point of this piece is
     * the point at (<code>x</code>, <code>y</code>) with a given <code>margin</code>,
     * and if that point is closer to bottom left point than to top left and bottom right points.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isBottomLeftPointAt = function (x, y, margin) {
        var points = this.getPoints();
        var distanceSquareToBottomLeftPoint = java.awt.geom.Point2D.distanceSq(x, y, points[3][0], points[3][1]);
        return distanceSquareToBottomLeftPoint <= margin * margin && distanceSquareToBottomLeftPoint < java.awt.geom.Point2D.distanceSq(x, y, points[0][0], points[0][1]) && distanceSquareToBottomLeftPoint < java.awt.geom.Point2D.distanceSq(x, y, points[2][0], points[2][1]);
    };
    /**
     * Returns <code>true</code> if the bottom right point of this piece is
     * the point at (<code>x</code>, <code>y</code>) with a given <code>margin</code>,
     * and if that point is closer to top left point than to top right and bottom left points.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isBottomRightPointAt = function (x, y, margin) {
        var points = this.getPoints();
        var distanceSquareToBottomRightPoint = java.awt.geom.Point2D.distanceSq(x, y, points[2][0], points[2][1]);
        return distanceSquareToBottomRightPoint <= margin * margin && distanceSquareToBottomRightPoint < java.awt.geom.Point2D.distanceSq(x, y, points[1][0], points[1][1]) && distanceSquareToBottomRightPoint < java.awt.geom.Point2D.distanceSq(x, y, points[3][0], points[3][1]);
    };
    /**
     * Returns <code>true</code> if the center point at which is displayed the name
     * of this piece is equal to the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    HomePieceOfFurniture.prototype.isNameCenterPointAt = function (x, y, margin) {
        return Math.abs(x - this.getX() - this.getNameXOffset()) <= margin && Math.abs(y - this.getY() - this.getNameYOffset()) <= margin;
    };
    /**
     * Returns the shape matching this piece.
     * @return {java.awt.Shape}
     * @private
     */
    HomePieceOfFurniture.prototype.getShape = function () {
        if (this.shapeCache == null) {
            var pieceRectangle = new java.awt.geom.Rectangle2D.Float(this.getX() - this.getWidth() / 2, this.getY() - this.getDepth() / 2, this.getWidth(), this.getDepth());
            var rotation = java.awt.geom.AffineTransform.getRotateInstance(this.getAngle(), this.getX(), this.getY());
            var it = pieceRectangle.getPathIterator(rotation);
            var pieceShape = new java.awt.geom.GeneralPath();
            pieceShape.append(it, false);
            this.shapeCache = pieceShape;
        }
        return this.shapeCache;
    };
    /**
     * Moves this piece of (<code>dx</code>, <code>dy</code>) units.
     * @param {number} dx
     * @param {number} dy
     */
    HomePieceOfFurniture.prototype.move = function (dx, dy) {
        this.setX(this.getX() + dx);
        this.setY(this.getY() + dy);
    };
    /**
     * Returns a clone of this piece.
     * @return {HomePieceOfFurniture}
     */
    HomePieceOfFurniture.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_10 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_10[p] = o[p];
            }
            return clone_10;
        } })(this);
        clone.propertyChangeSupport = new PropertyChangeSupport(clone);
        clone.level = null;
        return clone;
    };
    /**
     * Returns a comparator that compares furniture on a given <code>property</code> in ascending order.
     * @param {string} property
     * @return {*}
     */
    HomePieceOfFurniture.getFurnitureComparator = function (property) {
        return ((function (m, k) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                return m.entries[i].value;
            } return null; })(HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$(), property));
    };
    return HomePieceOfFurniture;
}(HomeObject));
HomePieceOfFurniture.__static_initialized = false;
HomePieceOfFurniture["__class"] = "HomePieceOfFurniture";
HomePieceOfFurniture["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "com.eteks.sweethome3d.model.PieceOfFurniture", "com.eteks.sweethome3d.model.Elevatable", "java.io.Serializable"];
(function (HomePieceOfFurniture) {
    var HomePieceOfFurniture$0 = (function () {
        function HomePieceOfFurniture$0(collator) {
            this.collator = collator;
        }
        HomePieceOfFurniture$0.prototype.compare = function (piece1, piece2) {
            if (piece1.catalogId === piece2.catalogId) {
                return 0;
            }
            else if (piece1.catalogId == null) {
                return -1;
            }
            else if (piece2.catalogId == null) {
                return 1;
            }
            else {
                return this.collator.compare(piece1.catalogId, piece2.catalogId);
            }
        };
        return HomePieceOfFurniture$0;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$0 = HomePieceOfFurniture$0;
    var HomePieceOfFurniture$1 = (function () {
        function HomePieceOfFurniture$1(collator) {
            this.collator = collator;
        }
        HomePieceOfFurniture$1.prototype.compare = function (piece1, piece2) {
            if (piece1.name === piece2.name) {
                return 0;
            }
            else if (piece1.name == null) {
                return -1;
            }
            else if (piece2.name == null) {
                return 1;
            }
            else {
                return this.collator.compare(piece1.name, piece2.name);
            }
        };
        return HomePieceOfFurniture$1;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$1 = HomePieceOfFurniture$1;
    var HomePieceOfFurniture$2 = (function () {
        function HomePieceOfFurniture$2() {
        }
        HomePieceOfFurniture$2.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$float$float(piece1.width, piece2.width);
        };
        return HomePieceOfFurniture$2;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$2 = HomePieceOfFurniture$2;
    var HomePieceOfFurniture$3 = (function () {
        function HomePieceOfFurniture$3() {
        }
        HomePieceOfFurniture$3.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$float$float(piece1.height, piece2.height);
        };
        return HomePieceOfFurniture$3;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$3 = HomePieceOfFurniture$3;
    var HomePieceOfFurniture$4 = (function () {
        function HomePieceOfFurniture$4() {
        }
        HomePieceOfFurniture$4.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$float$float(piece1.depth, piece2.depth);
        };
        return HomePieceOfFurniture$4;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$4 = HomePieceOfFurniture$4;
    var HomePieceOfFurniture$5 = (function () {
        function HomePieceOfFurniture$5() {
        }
        HomePieceOfFurniture$5.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$boolean$boolean(piece1.movable, piece2.movable);
        };
        return HomePieceOfFurniture$5;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$5 = HomePieceOfFurniture$5;
    var HomePieceOfFurniture$6 = (function () {
        function HomePieceOfFurniture$6() {
        }
        HomePieceOfFurniture$6.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$boolean$boolean(piece1.doorOrWindow, piece2.doorOrWindow);
        };
        return HomePieceOfFurniture$6;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$6 = HomePieceOfFurniture$6;
    var HomePieceOfFurniture$7 = (function () {
        function HomePieceOfFurniture$7() {
        }
        HomePieceOfFurniture$7.prototype.compare = function (piece1, piece2) {
            if (piece1.color === piece2.color) {
                return 0;
            }
            else if (piece1.color == null) {
                return -1;
            }
            else if (piece2.color == null) {
                return 1;
            }
            else {
                return piece1.color - piece2.color;
            }
        };
        return HomePieceOfFurniture$7;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$7 = HomePieceOfFurniture$7;
    var HomePieceOfFurniture$8 = (function () {
        function HomePieceOfFurniture$8(collator) {
            this.collator = collator;
        }
        HomePieceOfFurniture$8.prototype.compare = function (piece1, piece2) {
            if (piece1.texture === piece2.texture) {
                return 0;
            }
            else if (piece1.texture == null) {
                return -1;
            }
            else if (piece2.texture == null) {
                return 1;
            }
            else {
                return this.collator.compare(piece1.texture.getName(), piece2.texture.getName());
            }
        };
        return HomePieceOfFurniture$8;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$8 = HomePieceOfFurniture$8;
    var HomePieceOfFurniture$9 = (function () {
        function HomePieceOfFurniture$9() {
        }
        HomePieceOfFurniture$9.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$boolean$boolean(piece1.visible, piece2.visible);
        };
        return HomePieceOfFurniture$9;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$9 = HomePieceOfFurniture$9;
    var HomePieceOfFurniture$10 = (function () {
        function HomePieceOfFurniture$10() {
        }
        HomePieceOfFurniture$10.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$float$float(piece1.x, piece2.x);
        };
        return HomePieceOfFurniture$10;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$10 = HomePieceOfFurniture$10;
    var HomePieceOfFurniture$11 = (function () {
        function HomePieceOfFurniture$11() {
        }
        HomePieceOfFurniture$11.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$float$float(piece1.y, piece2.y);
        };
        return HomePieceOfFurniture$11;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$11 = HomePieceOfFurniture$11;
    var HomePieceOfFurniture$12 = (function () {
        function HomePieceOfFurniture$12() {
        }
        HomePieceOfFurniture$12.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$float$float(piece1.elevation, piece2.elevation);
        };
        return HomePieceOfFurniture$12;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$12 = HomePieceOfFurniture$12;
    var HomePieceOfFurniture$13 = (function () {
        function HomePieceOfFurniture$13() {
        }
        HomePieceOfFurniture$13.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$float$float(piece1.angle, piece2.angle);
        };
        return HomePieceOfFurniture$13;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$13 = HomePieceOfFurniture$13;
    var HomePieceOfFurniture$14 = (function () {
        function HomePieceOfFurniture$14() {
        }
        HomePieceOfFurniture$14.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$com_eteks_sweethome3d_model_Level$com_eteks_sweethome3d_model_Level(piece1.getLevel(), piece2.getLevel());
        };
        return HomePieceOfFurniture$14;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$14 = HomePieceOfFurniture$14;
    var HomePieceOfFurniture$15 = (function () {
        function HomePieceOfFurniture$15() {
        }
        HomePieceOfFurniture$15.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$java_math_BigDecimal$java_math_BigDecimal(piece1.price, piece2.price);
        };
        return HomePieceOfFurniture$15;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$15 = HomePieceOfFurniture$15;
    var HomePieceOfFurniture$16 = (function () {
        function HomePieceOfFurniture$16() {
        }
        HomePieceOfFurniture$16.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$java_math_BigDecimal$java_math_BigDecimal(piece1.valueAddedTaxPercentage, piece2.valueAddedTaxPercentage);
        };
        return HomePieceOfFurniture$16;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$16 = HomePieceOfFurniture$16;
    var HomePieceOfFurniture$17 = (function () {
        function HomePieceOfFurniture$17() {
        }
        HomePieceOfFurniture$17.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$java_math_BigDecimal$java_math_BigDecimal(piece1.getValueAddedTax(), piece2.getValueAddedTax());
        };
        return HomePieceOfFurniture$17;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$17 = HomePieceOfFurniture$17;
    var HomePieceOfFurniture$18 = (function () {
        function HomePieceOfFurniture$18() {
        }
        HomePieceOfFurniture$18.prototype.compare = function (piece1, piece2) {
            return HomePieceOfFurniture.compare$java_math_BigDecimal$java_math_BigDecimal(piece1.getPriceValueAddedTaxIncluded(), piece2.getPriceValueAddedTaxIncluded());
        };
        return HomePieceOfFurniture$18;
    }());
    HomePieceOfFurniture.HomePieceOfFurniture$18 = HomePieceOfFurniture$18;
})(HomePieceOfFurniture || (HomePieceOfFurniture = {}));
/**
 * Creates an exception for the given damaged home with the invalid content it may contains.
 * @param {Home} damagedHome
 * @param {Array} invalidContent
 * @param {string} message
 * @class
 */
var DamagedHomeRecorderException = (function (_super) {
    __extends(DamagedHomeRecorderException, _super);
    function DamagedHomeRecorderException(damagedHome, invalidContent, message) {
        var _this = this;
        if (((damagedHome != null && damagedHome instanceof Home) || damagedHome === null) && ((invalidContent != null && (invalidContent instanceof Array)) || invalidContent === null) && ((typeof message === 'string') || message === null)) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this, message) || this;
            _this.damagedHome = null;
            _this.invalidContent = null;
            _this.damagedHome = null;
            _this.invalidContent = null;
            (function () {
                _this.damagedHome = damagedHome;
                _this.invalidContent = invalidContent;
            })();
        }
        else if (((damagedHome != null && damagedHome instanceof Home) || damagedHome === null) && ((invalidContent != null && (invalidContent instanceof Array)) || invalidContent === null) && message === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this) || this;
            _this.damagedHome = null;
            _this.invalidContent = null;
            _this.damagedHome = null;
            _this.invalidContent = null;
            (function () {
                _this.damagedHome = damagedHome;
                _this.invalidContent = invalidContent;
            })();
        }
        else
            throw new Error('invalid overload');
        return _this;
    }
    /**
     * Returns the damaged home containing some possible invalid content.
     * This home can be handled and saved correctly only once the invalid content will be removed.
     * @return {Home}
     */
    DamagedHomeRecorderException.prototype.getDamagedHome = function () {
        return this.damagedHome;
    };
    /**
     * Returns the invalid content in the damaged home.
     * @return {Array}
     */
    DamagedHomeRecorderException.prototype.getInvalidContent = function () {
        return this.invalidContent;
    };
    return DamagedHomeRecorderException;
}(RecorderException));
DamagedHomeRecorderException["__class"] = "DamagedHomeRecorderException";
DamagedHomeRecorderException["__interfaces"] = ["java.io.Serializable"];
/**
 * Creates a <code>InterruptedRecorderException</code> from its message.
 * @param {string} message
 * @class
 */
var InterruptedRecorderException = (function (_super) {
    __extends(InterruptedRecorderException, _super);
    function InterruptedRecorderException(message) {
        var _this = this;
        if (((typeof message === 'string') || message === null)) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this, message) || this;
        }
        else if (message === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this) || this;
        }
        else
            throw new Error('invalid overload');
        return _this;
    }
    return InterruptedRecorderException;
}(RecorderException));
InterruptedRecorderException["__class"] = "InterruptedRecorderException";
InterruptedRecorderException["__interfaces"] = ["java.io.Serializable"];
/**
 * Exception thrown when there's not enough space to save a home.
 * @author Emmanuel Puybaret
 * @since 4.4
 * @extends RecorderException
 */
var NotEnoughSpaceRecorderException = (function (_super) {
    __extends(NotEnoughSpaceRecorderException, _super);
    function NotEnoughSpaceRecorderException(message, missingSpace) {
        var _this = _super.call(this, message) || this;
        _this.missingSpace = 0;
        _this.missingSpace = missingSpace;
        return _this;
    }
    /**
     * Returns the length of the missing space to save a home.
     * @return {number}
     */
    NotEnoughSpaceRecorderException.prototype.getMissingSpace = function () {
        return this.missingSpace;
    };
    return NotEnoughSpaceRecorderException;
}(RecorderException));
NotEnoughSpaceRecorderException["__class"] = "NotEnoughSpaceRecorderException";
NotEnoughSpaceRecorderException["__interfaces"] = ["java.io.Serializable"];
/**
 * Creates a camera at given location and angle.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} yaw
 * @param {number} pitch
 * @param {number} fieldOfView
 * @class
 */
var ObserverCamera = (function (_super) {
    __extends(ObserverCamera, _super);
    function ObserverCamera(x, y, z, yaw, pitch, fieldOfView) {
        var _this = _super.call(this, x, y, z, yaw, pitch, fieldOfView) || this;
        /*private*/ _this.propertyChangeSupport = new PropertyChangeSupport(_this);
        _this.fixedSize = false;
        _this.shapeCache = null;
        _this.rectangleShapeCache = null;
        return _this;
    }
    /**
     * Adds the property change <code>listener</code> in parameter to this camera.
     * @since 3.4
     * @param {PropertyChangeListener} listener
     */
    ObserverCamera.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
        _super.prototype.addPropertyChangeListener.call(this, listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this camera.
     * @since 3.4
     * @param {PropertyChangeListener} listener
     */
    ObserverCamera.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
        _super.prototype.removePropertyChangeListener.call(this, listener);
    };
    /**
     * Sets whether camera size should depends on its elevation and will notify listeners
     * bound to size properties of the size change.
     * @since 3.4
     * @param {boolean} fixedSize
     */
    ObserverCamera.prototype.setFixedSize = function (fixedSize) {
        if (this.fixedSize !== fixedSize) {
            var oldWidth = this.getWidth();
            var oldDepth = this.getDepth();
            var oldHeight = this.getHeight();
            this.fixedSize = fixedSize;
            this.shapeCache = null;
            this.rectangleShapeCache = null;
            this.propertyChangeSupport.firePropertyChange(/* name */ "WIDTH", oldWidth, this.getWidth());
            this.propertyChangeSupport.firePropertyChange(/* name */ "DEPTH", oldDepth, this.getDepth());
            this.propertyChangeSupport.firePropertyChange(/* name */ "HEIGHT", oldHeight, this.getHeight());
        }
    };
    /**
     * Returns <code>true</code> if the camera size doesn't change according to its elevation.
     * @since 3.4
     * @return {boolean}
     */
    ObserverCamera.prototype.isFixedSize = function () {
        return this.fixedSize;
    };
    /**
     * Sets the yaw angle in radians of this camera.
     * @param {number} yaw
     */
    ObserverCamera.prototype.setYaw = function (yaw) {
        _super.prototype.setYaw.call(this, yaw);
        this.shapeCache = null;
        this.rectangleShapeCache = null;
    };
    /**
     * Sets the abscissa of this camera.
     * @param {number} x
     */
    ObserverCamera.prototype.setX = function (x) {
        _super.prototype.setX.call(this, x);
        this.shapeCache = null;
        this.rectangleShapeCache = null;
    };
    /**
     * Sets the ordinate of this camera.
     * @param {number} y
     */
    ObserverCamera.prototype.setY = function (y) {
        _super.prototype.setY.call(this, y);
        this.shapeCache = null;
        this.rectangleShapeCache = null;
    };
    /**
     * Sets the elevation of this camera.
     * @param {number} z
     */
    ObserverCamera.prototype.setZ = function (z) {
        var oldWidth = this.getWidth();
        var oldDepth = this.getDepth();
        var oldHeight = this.getHeight();
        _super.prototype.setZ.call(this, z);
        this.shapeCache = null;
        this.rectangleShapeCache = null;
        this.propertyChangeSupport.firePropertyChange(/* name */ "WIDTH", oldWidth, this.getWidth());
        this.propertyChangeSupport.firePropertyChange(/* name */ "DEPTH", oldDepth, this.getDepth());
        this.propertyChangeSupport.firePropertyChange(/* name */ "HEIGHT", oldHeight, this.getHeight());
    };
    /**
     * Returns the width of this observer camera according to
     * human proportions with an eyes elevation at z.
     * @return {number}
     */
    ObserverCamera.prototype.getWidth = function () {
        if (this.fixedSize) {
            return 46.6;
        }
        else {
            var width = this.getZ() * 4 / 14;
            return Math.min(Math.max(width, 20), 62.5);
        }
    };
    /**
     * Returns the depth of this observer camera according to
     * human proportions with an eyes elevation at z.
     * @return {number}
     */
    ObserverCamera.prototype.getDepth = function () {
        if (this.fixedSize) {
            return 18.6;
        }
        else {
            var depth = this.getZ() * 8 / 70;
            return Math.min(Math.max(depth, 8), 25);
        }
    };
    /**
     * Returns the height of this observer camera according to
     * human proportions with an eyes elevation at z.
     * @return {number}
     */
    ObserverCamera.prototype.getHeight = function () {
        if (this.fixedSize) {
            return 175.0;
        }
        else {
            return this.getZ() * 15 / 14;
        }
    };
    ObserverCamera.prototype.getPoints = function (includeBaseboards) {
        if (includeBaseboards === undefined) {
            return this.getPoints$();
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Returns the points of each corner of the rectangle surrounding this camera.
     * @return {Array} an array of the 4 (x,y) coordinates of the camera corners.
     */
    ObserverCamera.prototype.getPoints$ = function () {
        var cameraPoints = (function (dims) { var allocate = function (dims) { if (dims.length == 0) {
            return 0;
        }
        else {
            var array = [];
            for (var i = 0; i < dims[0]; i++) {
                array.push(allocate(dims.slice(1)));
            }
            return array;
        } }; return allocate(dims); })([4, 2]);
        var it = this.getRectangleShape().getPathIterator(null);
        for (var i = 0; i < cameraPoints.length; i++) {
            it.currentSegment(cameraPoints[i]);
            it.next();
        }
        return cameraPoints;
    };
    /**
     * Returns <code>true</code> if this camera intersects
     * with the horizontal rectangle which opposite corners are at points
     * (<code>x0</code>, <code>y0</code>) and (<code>x1</code>, <code>y1</code>).
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {boolean}
     */
    ObserverCamera.prototype.intersectsRectangle = function (x0, y0, x1, y1) {
        var rectangle = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
        rectangle.add(x1, y1);
        return this.getShape().intersects(rectangle);
    };
    ObserverCamera.prototype.containsPoint = function (x, y, includeBaseboards, margin) {
        if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof includeBaseboards === 'number') || includeBaseboards === null) && margin === undefined) {
            return this.containsPoint$float$float$float(x, y, includeBaseboards);
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Returns <code>true</code> if this camera contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    ObserverCamera.prototype.containsPoint$float$float$float = function (x, y, margin) {
        if (margin === 0) {
            return this.getShape().contains(x, y);
        }
        else {
            return this.getShape().intersects(x - margin, y - margin, 2 * margin, 2 * margin);
        }
    };
    /**
     * Returns the ellipse shape matching this camera.
     * @return {java.awt.Shape}
     * @private
     */
    ObserverCamera.prototype.getShape = function () {
        if (this.shapeCache == null) {
            var cameraEllipse = new java.awt.geom.Ellipse2D.Float(this.getX() - this.getWidth() / 2, this.getY() - this.getDepth() / 2, this.getWidth(), this.getDepth());
            var rotation = java.awt.geom.AffineTransform.getRotateInstance(this.getYaw(), this.getX(), this.getY());
            var it = cameraEllipse.getPathIterator(rotation);
            var pieceShape = new java.awt.geom.GeneralPath();
            pieceShape.append(it, false);
            this.shapeCache = pieceShape;
        }
        return this.shapeCache;
    };
    /**
     * Returns the rectangle shape matching this camera.
     * @return {java.awt.Shape}
     * @private
     */
    ObserverCamera.prototype.getRectangleShape = function () {
        if (this.rectangleShapeCache == null) {
            var cameraRectangle = new java.awt.geom.Rectangle2D.Float(this.getX() - this.getWidth() / 2, this.getY() - this.getDepth() / 2, this.getWidth(), this.getDepth());
            var rotation = java.awt.geom.AffineTransform.getRotateInstance(this.getYaw(), this.getX(), this.getY());
            var it = cameraRectangle.getPathIterator(rotation);
            var cameraRectangleShape = new java.awt.geom.GeneralPath();
            cameraRectangleShape.append(it, false);
            this.rectangleShapeCache = cameraRectangleShape;
        }
        return this.rectangleShapeCache;
    };
    /**
     * Moves this camera of (<code>dx</code>, <code>dy</code>) units.
     * @param {number} dx
     * @param {number} dy
     */
    ObserverCamera.prototype.move = function (dx, dy) {
        this.setX(this.getX() + dx);
        this.setY(this.getY() + dy);
    };
    /**
     * Returns a clone of this camera.
     * @return {ObserverCamera}
     */
    ObserverCamera.prototype.clone = function () {
        var _this = this;
        return (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone[p] = o[p];
            }
            return clone;
        } })(this);
    };
    return ObserverCamera;
}(Camera));
ObserverCamera["__class"] = "ObserverCamera";
ObserverCamera["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "java.io.Serializable"];
/**
 * The home managed by the application with its furniture and walls.
 * @author Emmanuel Puybaret
 */
var Home = (function () {
    function Home(furniture, wallHeight) {
        var _this = this;
        if (((furniture != null && (furniture instanceof Array)) || furniture === null) && ((typeof wallHeight === 'number') || wallHeight === null)) {
            var __args = Array.prototype.slice.call(arguments);
            this.furniture = null;
            this.furnitureChangeSupport = null;
            this.selectedItems = null;
            this.selectionListeners = null;
            this.allLevelsSelection = false;
            this.levels = null;
            this.selectedLevel = null;
            this.levelsChangeSupport = null;
            this.walls = null;
            this.wallsChangeSupport = null;
            this.rooms = null;
            this.roomsChangeSupport = null;
            this.polylines = null;
            this.polylinesChangeSupport = null;
            this.dimensionLines = null;
            this.dimensionLinesChangeSupport = null;
            this.labels = null;
            this.labelsChangeSupport = null;
            this.camera = null;
            this.name = null;
            this.wallHeight = 0;
            this.modified = false;
            this.recovered = false;
            this.repaired = false;
            this.backgroundImage = null;
            this.observerCamera = null;
            this.topCamera = null;
            this.storedCameras = null;
            this.environment = null;
            this.print = null;
            this.furnitureSortedPropertyName = null;
            this.furnitureVisiblePropertyNames = null;
            this.furnitureDescendingSorted = false;
            this.visualProperties = null;
            this.properties = null;
            this.propertyChangeSupport = null;
            this.version = 0;
            this.basePlanLocked = false;
            this.compass = null;
            this.skyColor = 0;
            this.groundColor = 0;
            this.groundTexture = null;
            this.lightColor = 0;
            this.wallsAlpha = 0;
            this.furnitureSortedProperty = null;
            this.furnitureVisibleProperties = null;
            this.furnitureWithDoorsAndWindows = null;
            this.furnitureWithGroups = null;
            this.furniture = null;
            this.furnitureChangeSupport = null;
            this.selectedItems = null;
            this.selectionListeners = null;
            this.allLevelsSelection = false;
            this.levels = null;
            this.selectedLevel = null;
            this.levelsChangeSupport = null;
            this.walls = null;
            this.wallsChangeSupport = null;
            this.rooms = null;
            this.roomsChangeSupport = null;
            this.polylines = null;
            this.polylinesChangeSupport = null;
            this.dimensionLines = null;
            this.dimensionLinesChangeSupport = null;
            this.labels = null;
            this.labelsChangeSupport = null;
            this.camera = null;
            this.name = null;
            this.wallHeight = 0;
            this.modified = false;
            this.recovered = false;
            this.repaired = false;
            this.backgroundImage = null;
            this.observerCamera = null;
            this.topCamera = null;
            this.storedCameras = null;
            this.environment = null;
            this.print = null;
            this.furnitureSortedPropertyName = null;
            this.furnitureVisiblePropertyNames = null;
            this.furnitureDescendingSorted = false;
            this.visualProperties = null;
            this.properties = null;
            this.propertyChangeSupport = null;
            this.version = 0;
            this.basePlanLocked = false;
            this.compass = null;
            this.skyColor = 0;
            this.groundColor = 0;
            this.groundTexture = null;
            this.lightColor = 0;
            this.wallsAlpha = 0;
            this.furnitureSortedProperty = null;
            this.furnitureVisibleProperties = null;
            this.furnitureWithDoorsAndWindows = null;
            this.furnitureWithGroups = null;
            (function () {
                _this.furniture = (furniture.slice(0));
                _this.walls = ([]);
                _this.wallHeight = wallHeight;
                _this.furnitureVisibleProperties = ["NAME", "WIDTH", "DEPTH", "HEIGHT", "VISIBLE"].slice(0);
                _this.init(true);
                _this.addModelListeners();
            })();
        }
        else if (((furniture != null && (furniture instanceof Array)) || furniture === null) && wallHeight === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_28 = Array.prototype.slice.call(arguments);
                var wallHeight_1 = 250;
                this.furniture = null;
                this.furnitureChangeSupport = null;
                this.selectedItems = null;
                this.selectionListeners = null;
                this.allLevelsSelection = false;
                this.levels = null;
                this.selectedLevel = null;
                this.levelsChangeSupport = null;
                this.walls = null;
                this.wallsChangeSupport = null;
                this.rooms = null;
                this.roomsChangeSupport = null;
                this.polylines = null;
                this.polylinesChangeSupport = null;
                this.dimensionLines = null;
                this.dimensionLinesChangeSupport = null;
                this.labels = null;
                this.labelsChangeSupport = null;
                this.camera = null;
                this.name = null;
                this.wallHeight = 0;
                this.modified = false;
                this.recovered = false;
                this.repaired = false;
                this.backgroundImage = null;
                this.observerCamera = null;
                this.topCamera = null;
                this.storedCameras = null;
                this.environment = null;
                this.print = null;
                this.furnitureSortedPropertyName = null;
                this.furnitureVisiblePropertyNames = null;
                this.furnitureDescendingSorted = false;
                this.visualProperties = null;
                this.properties = null;
                this.propertyChangeSupport = null;
                this.version = 0;
                this.basePlanLocked = false;
                this.compass = null;
                this.skyColor = 0;
                this.groundColor = 0;
                this.groundTexture = null;
                this.lightColor = 0;
                this.wallsAlpha = 0;
                this.furnitureSortedProperty = null;
                this.furnitureVisibleProperties = null;
                this.furnitureWithDoorsAndWindows = null;
                this.furnitureWithGroups = null;
                this.furniture = null;
                this.furnitureChangeSupport = null;
                this.selectedItems = null;
                this.selectionListeners = null;
                this.allLevelsSelection = false;
                this.levels = null;
                this.selectedLevel = null;
                this.levelsChangeSupport = null;
                this.walls = null;
                this.wallsChangeSupport = null;
                this.rooms = null;
                this.roomsChangeSupport = null;
                this.polylines = null;
                this.polylinesChangeSupport = null;
                this.dimensionLines = null;
                this.dimensionLinesChangeSupport = null;
                this.labels = null;
                this.labelsChangeSupport = null;
                this.camera = null;
                this.name = null;
                this.wallHeight = 0;
                this.modified = false;
                this.recovered = false;
                this.repaired = false;
                this.backgroundImage = null;
                this.observerCamera = null;
                this.topCamera = null;
                this.storedCameras = null;
                this.environment = null;
                this.print = null;
                this.furnitureSortedPropertyName = null;
                this.furnitureVisiblePropertyNames = null;
                this.furnitureDescendingSorted = false;
                this.visualProperties = null;
                this.properties = null;
                this.propertyChangeSupport = null;
                this.version = 0;
                this.basePlanLocked = false;
                this.compass = null;
                this.skyColor = 0;
                this.groundColor = 0;
                this.groundTexture = null;
                this.lightColor = 0;
                this.wallsAlpha = 0;
                this.furnitureSortedProperty = null;
                this.furnitureVisibleProperties = null;
                this.furnitureWithDoorsAndWindows = null;
                this.furnitureWithGroups = null;
                (function () {
                    _this.furniture = (furniture.slice(0));
                    _this.walls = ([]);
                    _this.wallHeight = wallHeight_1;
                    _this.furnitureVisibleProperties = ["NAME", "WIDTH", "DEPTH", "HEIGHT", "VISIBLE"].slice(0);
                    _this.init(true);
                    _this.addModelListeners();
                })();
            }
        }
        else if (((furniture != null && furniture instanceof Home) || furniture === null) && wallHeight === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var home_1 = __args[0];
            this.furniture = null;
            this.furnitureChangeSupport = null;
            this.selectedItems = null;
            this.selectionListeners = null;
            this.allLevelsSelection = false;
            this.levels = null;
            this.selectedLevel = null;
            this.levelsChangeSupport = null;
            this.walls = null;
            this.wallsChangeSupport = null;
            this.rooms = null;
            this.roomsChangeSupport = null;
            this.polylines = null;
            this.polylinesChangeSupport = null;
            this.dimensionLines = null;
            this.dimensionLinesChangeSupport = null;
            this.labels = null;
            this.labelsChangeSupport = null;
            this.camera = null;
            this.name = null;
            this.wallHeight = 0;
            this.modified = false;
            this.recovered = false;
            this.repaired = false;
            this.backgroundImage = null;
            this.observerCamera = null;
            this.topCamera = null;
            this.storedCameras = null;
            this.environment = null;
            this.print = null;
            this.furnitureSortedPropertyName = null;
            this.furnitureVisiblePropertyNames = null;
            this.furnitureDescendingSorted = false;
            this.visualProperties = null;
            this.properties = null;
            this.propertyChangeSupport = null;
            this.version = 0;
            this.basePlanLocked = false;
            this.compass = null;
            this.skyColor = 0;
            this.groundColor = 0;
            this.groundTexture = null;
            this.lightColor = 0;
            this.wallsAlpha = 0;
            this.furnitureSortedProperty = null;
            this.furnitureVisibleProperties = null;
            this.furnitureWithDoorsAndWindows = null;
            this.furnitureWithGroups = null;
            this.furniture = null;
            this.furnitureChangeSupport = null;
            this.selectedItems = null;
            this.selectionListeners = null;
            this.allLevelsSelection = false;
            this.levels = null;
            this.selectedLevel = null;
            this.levelsChangeSupport = null;
            this.walls = null;
            this.wallsChangeSupport = null;
            this.rooms = null;
            this.roomsChangeSupport = null;
            this.polylines = null;
            this.polylinesChangeSupport = null;
            this.dimensionLines = null;
            this.dimensionLinesChangeSupport = null;
            this.labels = null;
            this.labelsChangeSupport = null;
            this.camera = null;
            this.name = null;
            this.wallHeight = 0;
            this.modified = false;
            this.recovered = false;
            this.repaired = false;
            this.backgroundImage = null;
            this.observerCamera = null;
            this.topCamera = null;
            this.storedCameras = null;
            this.environment = null;
            this.print = null;
            this.furnitureSortedPropertyName = null;
            this.furnitureVisiblePropertyNames = null;
            this.furnitureDescendingSorted = false;
            this.visualProperties = null;
            this.properties = null;
            this.propertyChangeSupport = null;
            this.version = 0;
            this.basePlanLocked = false;
            this.compass = null;
            this.skyColor = 0;
            this.groundColor = 0;
            this.groundTexture = null;
            this.lightColor = 0;
            this.wallsAlpha = 0;
            this.furnitureSortedProperty = null;
            this.furnitureVisibleProperties = null;
            this.furnitureWithDoorsAndWindows = null;
            this.furnitureWithGroups = null;
            (function () {
                _this.wallHeight = home_1.getWallHeight();
                Home.copyHomeData(home_1, _this);
                Home.initListenersSupport(_this);
                _this.addModelListeners();
            })();
        }
        else if (((typeof furniture === 'number') || furniture === null) && wallHeight === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var wallHeight_2 = __args[0];
            {
                var __args_29 = Array.prototype.slice.call(arguments);
                var furniture_1 = [];
                this.furniture = null;
                this.furnitureChangeSupport = null;
                this.selectedItems = null;
                this.selectionListeners = null;
                this.allLevelsSelection = false;
                this.levels = null;
                this.selectedLevel = null;
                this.levelsChangeSupport = null;
                this.walls = null;
                this.wallsChangeSupport = null;
                this.rooms = null;
                this.roomsChangeSupport = null;
                this.polylines = null;
                this.polylinesChangeSupport = null;
                this.dimensionLines = null;
                this.dimensionLinesChangeSupport = null;
                this.labels = null;
                this.labelsChangeSupport = null;
                this.camera = null;
                this.name = null;
                this.wallHeight = 0;
                this.modified = false;
                this.recovered = false;
                this.repaired = false;
                this.backgroundImage = null;
                this.observerCamera = null;
                this.topCamera = null;
                this.storedCameras = null;
                this.environment = null;
                this.print = null;
                this.furnitureSortedPropertyName = null;
                this.furnitureVisiblePropertyNames = null;
                this.furnitureDescendingSorted = false;
                this.visualProperties = null;
                this.properties = null;
                this.propertyChangeSupport = null;
                this.version = 0;
                this.basePlanLocked = false;
                this.compass = null;
                this.skyColor = 0;
                this.groundColor = 0;
                this.groundTexture = null;
                this.lightColor = 0;
                this.wallsAlpha = 0;
                this.furnitureSortedProperty = null;
                this.furnitureVisibleProperties = null;
                this.furnitureWithDoorsAndWindows = null;
                this.furnitureWithGroups = null;
                this.furniture = null;
                this.furnitureChangeSupport = null;
                this.selectedItems = null;
                this.selectionListeners = null;
                this.allLevelsSelection = false;
                this.levels = null;
                this.selectedLevel = null;
                this.levelsChangeSupport = null;
                this.walls = null;
                this.wallsChangeSupport = null;
                this.rooms = null;
                this.roomsChangeSupport = null;
                this.polylines = null;
                this.polylinesChangeSupport = null;
                this.dimensionLines = null;
                this.dimensionLinesChangeSupport = null;
                this.labels = null;
                this.labelsChangeSupport = null;
                this.camera = null;
                this.name = null;
                this.wallHeight = 0;
                this.modified = false;
                this.recovered = false;
                this.repaired = false;
                this.backgroundImage = null;
                this.observerCamera = null;
                this.topCamera = null;
                this.storedCameras = null;
                this.environment = null;
                this.print = null;
                this.furnitureSortedPropertyName = null;
                this.furnitureVisiblePropertyNames = null;
                this.furnitureDescendingSorted = false;
                this.visualProperties = null;
                this.properties = null;
                this.propertyChangeSupport = null;
                this.version = 0;
                this.basePlanLocked = false;
                this.compass = null;
                this.skyColor = 0;
                this.groundColor = 0;
                this.groundTexture = null;
                this.lightColor = 0;
                this.wallsAlpha = 0;
                this.furnitureSortedProperty = null;
                this.furnitureVisibleProperties = null;
                this.furnitureWithDoorsAndWindows = null;
                this.furnitureWithGroups = null;
                (function () {
                    _this.furniture = (furniture_1.slice(0));
                    _this.walls = ([]);
                    _this.wallHeight = wallHeight_2;
                    _this.furnitureVisibleProperties = ["NAME", "WIDTH", "DEPTH", "HEIGHT", "VISIBLE"].slice(0);
                    _this.init(true);
                    _this.addModelListeners();
                })();
            }
        }
        else if (furniture === undefined && wallHeight === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            {
                var __args_30 = Array.prototype.slice.call(arguments);
                var wallHeight_3 = 250;
                {
                    var __args_31 = Array.prototype.slice.call(arguments);
                    var furniture_2 = [];
                    this.furniture = null;
                    this.furnitureChangeSupport = null;
                    this.selectedItems = null;
                    this.selectionListeners = null;
                    this.allLevelsSelection = false;
                    this.levels = null;
                    this.selectedLevel = null;
                    this.levelsChangeSupport = null;
                    this.walls = null;
                    this.wallsChangeSupport = null;
                    this.rooms = null;
                    this.roomsChangeSupport = null;
                    this.polylines = null;
                    this.polylinesChangeSupport = null;
                    this.dimensionLines = null;
                    this.dimensionLinesChangeSupport = null;
                    this.labels = null;
                    this.labelsChangeSupport = null;
                    this.camera = null;
                    this.name = null;
                    this.wallHeight = 0;
                    this.modified = false;
                    this.recovered = false;
                    this.repaired = false;
                    this.backgroundImage = null;
                    this.observerCamera = null;
                    this.topCamera = null;
                    this.storedCameras = null;
                    this.environment = null;
                    this.print = null;
                    this.furnitureSortedPropertyName = null;
                    this.furnitureVisiblePropertyNames = null;
                    this.furnitureDescendingSorted = false;
                    this.visualProperties = null;
                    this.properties = null;
                    this.propertyChangeSupport = null;
                    this.version = 0;
                    this.basePlanLocked = false;
                    this.compass = null;
                    this.skyColor = 0;
                    this.groundColor = 0;
                    this.groundTexture = null;
                    this.lightColor = 0;
                    this.wallsAlpha = 0;
                    this.furnitureSortedProperty = null;
                    this.furnitureVisibleProperties = null;
                    this.furnitureWithDoorsAndWindows = null;
                    this.furnitureWithGroups = null;
                    this.furniture = null;
                    this.furnitureChangeSupport = null;
                    this.selectedItems = null;
                    this.selectionListeners = null;
                    this.allLevelsSelection = false;
                    this.levels = null;
                    this.selectedLevel = null;
                    this.levelsChangeSupport = null;
                    this.walls = null;
                    this.wallsChangeSupport = null;
                    this.rooms = null;
                    this.roomsChangeSupport = null;
                    this.polylines = null;
                    this.polylinesChangeSupport = null;
                    this.dimensionLines = null;
                    this.dimensionLinesChangeSupport = null;
                    this.labels = null;
                    this.labelsChangeSupport = null;
                    this.camera = null;
                    this.name = null;
                    this.wallHeight = 0;
                    this.modified = false;
                    this.recovered = false;
                    this.repaired = false;
                    this.backgroundImage = null;
                    this.observerCamera = null;
                    this.topCamera = null;
                    this.storedCameras = null;
                    this.environment = null;
                    this.print = null;
                    this.furnitureSortedPropertyName = null;
                    this.furnitureVisiblePropertyNames = null;
                    this.furnitureDescendingSorted = false;
                    this.visualProperties = null;
                    this.properties = null;
                    this.propertyChangeSupport = null;
                    this.version = 0;
                    this.basePlanLocked = false;
                    this.compass = null;
                    this.skyColor = 0;
                    this.groundColor = 0;
                    this.groundTexture = null;
                    this.lightColor = 0;
                    this.wallsAlpha = 0;
                    this.furnitureSortedProperty = null;
                    this.furnitureVisibleProperties = null;
                    this.furnitureWithDoorsAndWindows = null;
                    this.furnitureWithGroups = null;
                    (function () {
                        _this.furniture = (furniture_2.slice(0));
                        _this.walls = ([]);
                        _this.wallHeight = wallHeight_3;
                        _this.furnitureVisibleProperties = ["NAME", "WIDTH", "DEPTH", "HEIGHT", "VISIBLE"].slice(0);
                        _this.init(true);
                        _this.addModelListeners();
                    })();
                }
            }
        }
        else
            throw new Error('invalid overload');
    }
    Home.LEVEL_ELEVATION_COMPARATOR_$LI$ = function () {
        if (Home.LEVEL_ELEVATION_COMPARATOR == null)
            Home.LEVEL_ELEVATION_COMPARATOR = function (level1, level2) {
                var elevationComparison = (level1.getElevation() - level2.getElevation());
                if (elevationComparison !== 0) {
                    return elevationComparison;
                }
                else {
                    return level1.getElevationIndex() - level2.getElevationIndex();
                }
            };
        return Home.LEVEL_ELEVATION_COMPARATOR;
    };
    ;
    Home.prototype.moveVisualProperty = function (visualPropertyName) {
        if (this.visualProperties.hasOwnProperty(visualPropertyName)) {
            var value = (function (m, k) { return m[k] ? m[k] : null; })(this.visualProperties, visualPropertyName);
            /* put */ (this.properties[visualPropertyName] = value != null ? new String(value).toString() : null);
            /* remove */ delete this.visualProperties[visualPropertyName];
        }
    };
    Home.prototype.init = function (newHome) {
        this.selectedItems = ([]);
        Home.initListenersSupport(this);
        if (this.furnitureVisibleProperties == null) {
            this.furnitureVisibleProperties = ["NAME", "WIDTH", "DEPTH", "HEIGHT", "COLOR", "MOVABLE", "DOOR_OR_WINDOW", "VISIBLE"].slice(0);
        }
        this.topCamera = new Camera(50, 1050, 1010, (Math.fround ? (Math.PI) : Math.fround(Math.PI)), (Math.fround ? (Math.PI) : Math.fround(Math.PI)) / 4, (Math.fround ? (Math.PI) : Math.fround(Math.PI)) * 63 / 180);
        this.observerCamera = new ObserverCamera(50, 50, 170, 7 * (Math.fround ? (Math.PI) : Math.fround(Math.PI)) / 4, (Math.fround ? (Math.PI) : Math.fround(Math.PI)) / 16, (Math.fround ? (Math.PI) : Math.fround(Math.PI)) * 63 / 180);
        this.storedCameras = [];
        this.environment = new HomeEnvironment();
        this.rooms = ([]);
        this.polylines = ([]);
        this.dimensionLines = ([]);
        this.labels = ([]);
        this.compass = new Compass(-100, 50, 100);
        this.levels = ([]);
        this.compass.setVisible(newHome);
        this.visualProperties = ({});
        this.properties = ({});
        this.version = Home.CURRENT_VERSION;
    };
    Home.initListenersSupport = function (home) {
        home.furnitureChangeSupport = (new CollectionChangeSupport(home));
        home.selectionListeners = ([]);
        home.levelsChangeSupport = (new CollectionChangeSupport(home));
        home.wallsChangeSupport = (new CollectionChangeSupport(home));
        home.roomsChangeSupport = (new CollectionChangeSupport(home));
        home.polylinesChangeSupport = (new CollectionChangeSupport(home));
        home.dimensionLinesChangeSupport = (new CollectionChangeSupport(home));
        home.labelsChangeSupport = (new CollectionChangeSupport(home));
        home.propertyChangeSupport = new PropertyChangeSupport(home);
    };
    /**
     * Adds listeners to model.
     * @private
     */
    Home.prototype.addModelListeners = function () {
        var levelElevationChangeListener = new Home.Home$0(this);
        for (var index180 = 0; index180 < this.levels.length; index180++) {
            var level = this.levels[index180];
            {
                level.addPropertyChangeListener(levelElevationChangeListener);
            }
        }
        this.addLevelsListener(function (ev) {
            switch ((ev.getType())) {
                case CollectionEvent.Type.ADD:
                    ev.getItem().addPropertyChangeListener(levelElevationChangeListener);
                    break;
                case CollectionEvent.Type.DELETE:
                    ev.getItem().removePropertyChangeListener(levelElevationChangeListener);
                    break;
            }
        });
    };
    /**
     * Returns <code>true</code> if the given <code>property</code> is compatible
     * with the first set of sortable properties that existed in <code>HomePieceOfFurniture</code> class.
     * @param {string} property
     * @return {boolean}
     * @private
     */
    Home.prototype.isFurnitureSortedPropertyBackwardCompatible = function (property) {
        switch ((property)) {
            case "NAME":
            case "WIDTH":
            case "DEPTH":
            case "HEIGHT":
            case "MOVABLE":
            case "DOOR_OR_WINDOW":
            case "COLOR":
            case "VISIBLE":
            case "X":
            case "Y":
            case "ELEVATION":
            case "ANGLE":
                return true;
            default:
                return false;
        }
    };
    /**
     * Returns all the pieces of the given <code>furnitureGroup</code>.
     * @param {HomeFurnitureGroup} furnitureGroup
     * @return {Array}
     * @private
     */
    Home.prototype.getGroupFurniture = function (furnitureGroup) {
        var groupFurniture = ([]);
        {
            var array182 = furnitureGroup.getFurniture();
            for (var index181 = 0; index181 < array182.length; index181++) {
                var piece = array182[index181];
                {
                    if (piece != null && piece instanceof HomeFurnitureGroup) {
                        /* addAll */ (function (l1, l2) { return l1.push.apply(l1, l2); })(groupFurniture, this.getGroupFurniture(piece));
                    }
                    else {
                        /* add */ groupFurniture.push(piece);
                    }
                }
            }
        }
        return groupFurniture;
    };
    /**
     * Adds the level <code>listener</code> in parameter to this home.
     * @param {CollectionListener} listener the listener to add
     * @since 3.4
     */
    Home.prototype.addLevelsListener = function (listener) {
        this.levelsChangeSupport.addCollectionListener((listener));
    };
    /**
     * Removes the level <code>listener</code> in parameter from this home.
     * @param {CollectionListener} listener the listener to remove
     * @since 3.4
     */
    Home.prototype.removeLevelsListener = function (listener) {
        this.levelsChangeSupport.removeCollectionListener((listener));
    };
    /**
     * Returns an unmodifiable collection of the levels of this home.
     * @since 3.4
     * @return {Array}
     */
    Home.prototype.getLevels = function () {
        return this.levels.slice(0);
    };
    /**
     * Adds the given <code>level</code> to the list of levels of this home.
     * Once the <code>level</code> is added, level listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {Level} level  the level to add
     * @since 3.4
     */
    Home.prototype.addLevel = function (level) {
        if (level.getElevationIndex() < 0) {
            var elevationIndex = 0;
            for (var index183 = 0; index183 < this.levels.length; index183++) {
                var homeLevel = this.levels[index183];
                {
                    if (homeLevel.getElevation() === level.getElevation()) {
                        elevationIndex = homeLevel.getElevationIndex() + 1;
                    }
                    else if (homeLevel.getElevation() > level.getElevation()) {
                        break;
                    }
                }
            }
            level.setElevationIndex(elevationIndex);
        }
        this.levels = (this.levels.slice(0));
        var index = (function (l, key, c) { var comp = c; if (typeof c != 'function') {
            comp = function (a, b) { return c.compare(a, b); };
        } var low = 0; var high = l.length - 1; while (low <= high) {
            var mid = (low + high) >>> 1;
            var midVal = l[mid];
            var cmp = comp(midVal, key);
            if (cmp < 0)
                low = mid + 1;
            else if (cmp > 0)
                high = mid - 1;
            else
                return mid;
        } return -(low + 1); })(this.levels, level, Home.LEVEL_ELEVATION_COMPARATOR_$LI$());
        var levelIndex;
        if (index >= 0) {
            levelIndex = index;
        }
        else {
            levelIndex = -(index + 1);
        }
        /* add */ this.levels.splice(levelIndex, 0, level);
        this.levelsChangeSupport.fireCollectionChanged(level, levelIndex, CollectionEvent.Type.ADD);
    };
    /**
     * Removes the given <code>level</code> from the set of levels of this home
     * and all the furniture, walls, rooms, dimension lines and labels that belong to this level.
     * Once the <code>level</code> is removed, level listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#DELETE}.
     * @param {Level} level  the level to remove
     * @since 3.4
     */
    Home.prototype.deleteLevel = function (level) {
        var index = this.levels.indexOf(level);
        if (index !== -1) {
            for (var index184 = 0; index184 < this.furniture.length; index184++) {
                var piece = this.furniture[index184];
                {
                    if (piece.getLevel() === level) {
                        this.deletePieceOfFurniture(piece);
                    }
                }
            }
            for (var index185 = 0; index185 < this.rooms.length; index185++) {
                var room = this.rooms[index185];
                {
                    if (room.getLevel() === level) {
                        this.deleteRoom(room);
                    }
                }
            }
            for (var index186 = 0; index186 < this.walls.length; index186++) {
                var wall = this.walls[index186];
                {
                    if (wall.getLevel() === level) {
                        this.deleteWall(wall);
                    }
                }
            }
            for (var index187 = 0; index187 < this.polylines.length; index187++) {
                var polyline = this.polylines[index187];
                {
                    if (polyline.getLevel() === level) {
                        this.deletePolyline(polyline);
                    }
                }
            }
            for (var index188 = 0; index188 < this.dimensionLines.length; index188++) {
                var dimensionLine = this.dimensionLines[index188];
                {
                    if (dimensionLine.getLevel() === level) {
                        this.deleteDimensionLine(dimensionLine);
                    }
                }
            }
            for (var index189 = 0; index189 < this.labels.length; index189++) {
                var label = this.labels[index189];
                {
                    if (label.getLevel() === level) {
                        this.deleteLabel(label);
                    }
                }
            }
            if (this.selectedLevel === level) {
                if (this.levels.length === 1) {
                    this.setSelectedLevel(null);
                    this.setAllLevelsSelection(false);
                }
                else {
                    this.setSelectedLevel(/* get */ this.levels[index >= 1 ? index - 1 : index + 1]);
                }
            }
            this.levels = (this.levels.slice(0));
            /* remove */ this.levels.splice(index, 1);
            this.levelsChangeSupport.fireCollectionChanged(level, index, CollectionEvent.Type.DELETE);
        }
    };
    /**
     * Returns the selected level in home or <code>null</code> if home has no level.
     * @since 3.4
     * @return {Level}
     */
    Home.prototype.getSelectedLevel = function () {
        return this.selectedLevel;
    };
    /**
     * Sets the selected level in home and notifies listeners of the change.
     * @param level  the level to select
     * @since 3.4
     * @param {Level} selectedLevel
     */
    Home.prototype.setSelectedLevel = function (selectedLevel) {
        if (selectedLevel !== this.selectedLevel) {
            var oldSelectedLevel = this.selectedLevel;
            this.selectedLevel = selectedLevel;
            this.propertyChangeSupport.firePropertyChange(/* name */ "SELECTED_LEVEL", oldSelectedLevel, selectedLevel);
        }
    };
    /**
     * Returns <code>true</code> if the selected items in this home are from all levels.
     * @since 4.4
     * @return {boolean}
     */
    Home.prototype.isAllLevelsSelection = function () {
        return this.allLevelsSelection;
    };
    /**
     * Sets whether the selected items in this home are from all levels, and notifies listeners of the change.
     * @since 4.4
     * @param {boolean} selectionAtAllLevels
     */
    Home.prototype.setAllLevelsSelection = function (selectionAtAllLevels) {
        if (selectionAtAllLevels !== this.allLevelsSelection) {
            this.allLevelsSelection = selectionAtAllLevels;
            this.propertyChangeSupport.firePropertyChange(/* name */ "ALL_LEVELS_SELECTION", !selectionAtAllLevels, selectionAtAllLevels);
        }
    };
    /**
     * Adds the furniture <code>listener</code> in parameter to this home.
     * @param {CollectionListener} listener the listener to add
     */
    Home.prototype.addFurnitureListener = function (listener) {
        this.furnitureChangeSupport.addCollectionListener((listener));
    };
    /**
     * Removes the furniture <code>listener</code> in parameter from this home.
     * @param {CollectionListener} listener the listener to remove
     */
    Home.prototype.removeFurnitureListener = function (listener) {
        this.furnitureChangeSupport.removeCollectionListener((listener));
    };
    /**
     * Returns an unmodifiable list of the furniture managed by this home.
     * This furniture in this list is always sorted in the index order they were added to home.
     * @return {Array}
     */
    Home.prototype.getFurniture = function () {
        return this.furniture.slice(0);
    };
    /**
     * Adds the <code>piece</code> in parameter to this home at the end of the furniture list.
     * Once the <code>piece</code> is added, furniture listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification.
     * @param {HomePieceOfFurniture} piece  the piece to add
     */
    Home.prototype.addPieceOfFurniture$com_eteks_sweethome3d_model_HomePieceOfFurniture = function (piece) {
        this.addPieceOfFurniture$com_eteks_sweethome3d_model_HomePieceOfFurniture$int(piece, /* size */ this.furniture.length);
    };
    /**
     * Adds the <code>piece</code> in parameter at a given <code>index</code>.
     * Once the <code>piece</code> is added, furniture listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification.
     * @param {HomePieceOfFurniture} piece  the piece to add
     * @param {number} index  the index at which the piece will be added
     */
    Home.prototype.addPieceOfFurniture$com_eteks_sweethome3d_model_HomePieceOfFurniture$int = function (piece, index) {
        this.furniture = (this.furniture.slice(0));
        piece.setLevel(this.selectedLevel);
        /* add */ this.furniture.splice(index, 0, piece);
        this.furnitureChangeSupport.fireCollectionChanged(piece, index, CollectionEvent.Type.ADD);
    };
    /**
     * Adds the <code>piece</code> in parameter at a given <code>index</code>.
     * Once the <code>piece</code> is added, furniture listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification.
     * @param {HomePieceOfFurniture} piece  the piece to add
     * @param {number} index  the index at which the piece will be added
     */
    Home.prototype.addPieceOfFurniture = function (piece, index) {
        if (((piece != null && piece instanceof HomePieceOfFurniture) || piece === null) && ((typeof index === 'number') || index === null)) {
            return this.addPieceOfFurniture$com_eteks_sweethome3d_model_HomePieceOfFurniture$int(piece, index);
        }
        else if (((piece != null && piece instanceof HomePieceOfFurniture) || piece === null) && index === undefined) {
            return this.addPieceOfFurniture$com_eteks_sweethome3d_model_HomePieceOfFurniture(piece);
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Adds the <code>piece</code> in parameter at the <code>index</code> in the given <code>group</code>.
     * Once the <code>piece</code> is added, furniture listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification with an event {@link CollectionEvent#getIndex() index} equal to -1.
     * @param {HomePieceOfFurniture} piece  the piece to add
     * @param {HomeFurnitureGroup} group  the group to which the piece will be added
     * @param {number} index  the index at which the piece will be added
     */
    Home.prototype.addPieceOfFurnitureToGroup = function (piece, group, index) {
        piece.setLevel(this.selectedLevel);
        group.addPieceOfFurniture(piece, index);
        this.furnitureChangeSupport.fireCollectionChanged(piece, CollectionEvent.Type.ADD);
    };
    /**
     * Deletes the <code>piece</code> in parameter from this home.
     * Once the <code>piece</code> is deleted, furniture listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification. If the removed <code>piece</code> belongs to a group, the
     * {@link CollectionEvent#getIndex() index} of the event will be -1.
     * @param {HomePieceOfFurniture} piece  the piece to remove
     */
    Home.prototype.deletePieceOfFurniture = function (piece) {
        this.deselectItem(piece);
        var index = this.furniture.indexOf(piece);
        var group = index === -1 ? this.getPieceOfFurnitureGroup(piece, null, this.furniture) : null;
        if (index !== -1 || group != null) {
            piece.setLevel(null);
            this.furniture = (this.furniture.slice(0));
            if (group != null) {
                group.deletePieceOfFurniture(piece);
                this.furnitureChangeSupport.fireCollectionChanged(piece, CollectionEvent.Type.DELETE);
            }
            else {
                /* remove */ this.furniture.splice(index, 1);
                this.furnitureChangeSupport.fireCollectionChanged(piece, index, CollectionEvent.Type.DELETE);
            }
        }
    };
    /**
     * Returns the furniture group that contains the given <code>piece</code> or <code>null</code>
     * if it can't be found.
     * @param {HomePieceOfFurniture} piece
     * @param {HomeFurnitureGroup} furnitureGroup
     * @param {Array} furniture
     * @return {HomeFurnitureGroup}
     * @private
     */
    Home.prototype.getPieceOfFurnitureGroup = function (piece, furnitureGroup, furniture) {
        for (var index190 = 0; index190 < furniture.length; index190++) {
            var homePiece = furniture[index190];
            {
                if ((function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(homePiece, piece)) {
                    return furnitureGroup;
                }
                else if (homePiece != null && homePiece instanceof HomeFurnitureGroup) {
                    var group = this.getPieceOfFurnitureGroup(piece, homePiece, homePiece.getFurniture());
                    if (group != null) {
                        return group;
                    }
                }
            }
        }
        return null;
    };
    /**
     * Adds the selection <code>listener</code> in parameter to this home.
     * @param {SelectionListener} listener the listener to add
     */
    Home.prototype.addSelectionListener = function (listener) {
        /* add */ this.selectionListeners.push(listener);
    };
    /**
     * Removes the selection <code>listener</code> in parameter from this home.
     * @param {SelectionListener} listener the listener to remove
     */
    Home.prototype.removeSelectionListener = function (listener) {
        /* remove */ (function (a) { return a.splice(a.indexOf(listener), 1); })(this.selectionListeners);
    };
    /**
     * Returns an unmodifiable list of the selected items in home.
     * @return {Array}
     */
    Home.prototype.getSelectedItems = function () {
        return this.selectedItems.slice(0);
    };
    /**
     * Sets the selected items in home and notifies listeners selection change.
     * @param {Array} selectedItems the list of selected items
     */
    Home.prototype.setSelectedItems = function (selectedItems) {
        this.selectedItems = (selectedItems.slice(0));
        if (!(this.selectionListeners.length == 0)) {
            var selectionEvent = new SelectionEvent(this, this.getSelectedItems());
            var listeners = this.selectionListeners.slice(0);
            for (var index191 = 0; index191 < listeners.length; index191++) {
                var listener = listeners[index191];
                {
                    listener.selectionChanged(selectionEvent);
                }
            }
        }
    };
    /**
     * Deselects <code>item</code> if it's selected and notifies listeners selection change.
     * @param {Selectable} item  the item to remove from selected items
     * @since 2.2
     */
    Home.prototype.deselectItem = function (item) {
        var pieceSelectionIndex = this.selectedItems.indexOf(item);
        if (pieceSelectionIndex !== -1) {
            var selectedItems = (this.getSelectedItems().slice(0));
            /* remove */ selectedItems.splice(pieceSelectionIndex, 1);
            this.setSelectedItems(selectedItems);
        }
    };
    /**
     * Adds the room <code>listener</code> in parameter to this home.
     * @param {CollectionListener} listener the listener to add
     */
    Home.prototype.addRoomsListener = function (listener) {
        this.roomsChangeSupport.addCollectionListener((listener));
    };
    /**
     * Removes the room <code>listener</code> in parameter from this home.
     * @param {CollectionListener} listener the listener to remove
     */
    Home.prototype.removeRoomsListener = function (listener) {
        this.roomsChangeSupport.removeCollectionListener((listener));
    };
    /**
     * Returns an unmodifiable collection of the rooms of this home.
     * @return {Array}
     */
    Home.prototype.getRooms = function () {
        return this.rooms.slice(0);
    };
    /**
     * Adds the given <code>room</code> at the end of the rooms list of this home.
     * Once the <code>room</code> is added, room listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {Room} room   the room to add
     */
    Home.prototype.addRoom$com_eteks_sweethome3d_model_Room = function (room) {
        this.addRoom$com_eteks_sweethome3d_model_Room$int(room, /* size */ this.rooms.length);
    };
    /**
     * Adds the <code>room</code> in parameter at a given <code>index</code>.
     * Once the <code>room</code> is added, room listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {Room} room   the room to add
     * @param {number} index  the index at which the room will be added
     */
    Home.prototype.addRoom$com_eteks_sweethome3d_model_Room$int = function (room, index) {
        this.rooms = (this.rooms.slice(0));
        /* add */ this.rooms.splice(index, 0, room);
        room.setLevel(this.selectedLevel);
        this.roomsChangeSupport.fireCollectionChanged(room, index, CollectionEvent.Type.ADD);
    };
    /**
     * Adds the <code>room</code> in parameter at a given <code>index</code>.
     * Once the <code>room</code> is added, room listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {Room} room   the room to add
     * @param {number} index  the index at which the room will be added
     */
    Home.prototype.addRoom = function (room, index) {
        if (((room != null && room instanceof Room) || room === null) && ((typeof index === 'number') || index === null)) {
            return this.addRoom$com_eteks_sweethome3d_model_Room$int(room, index);
        }
        else if (((room != null && room instanceof Room) || room === null) && index === undefined) {
            return this.addRoom$com_eteks_sweethome3d_model_Room(room);
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Removes the given <code>room</code> from the set of rooms of this home.
     * Once the <code>room</code> is removed, room listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#DELETE}.
     * @param {Room} room  the room to remove
     */
    Home.prototype.deleteRoom = function (room) {
        this.deselectItem(room);
        var index = this.rooms.indexOf(room);
        if (index !== -1) {
            room.setLevel(null);
            this.rooms = (this.rooms.slice(0));
            /* remove */ this.rooms.splice(index, 1);
            this.roomsChangeSupport.fireCollectionChanged(room, index, CollectionEvent.Type.DELETE);
        }
    };
    /**
     * Adds the wall <code>listener</code> in parameter to this home.
     * @param {CollectionListener} listener the listener to add
     */
    Home.prototype.addWallsListener = function (listener) {
        this.wallsChangeSupport.addCollectionListener((listener));
    };
    /**
     * Removes the wall <code>listener</code> in parameter from this home.
     * @param {CollectionListener} listener the listener to remove
     */
    Home.prototype.removeWallsListener = function (listener) {
        this.wallsChangeSupport.removeCollectionListener((listener));
    };
    /**
     * Returns an unmodifiable collection of the walls of this home.
     * @return {Array}
     */
    Home.prototype.getWalls = function () {
        return this.walls.slice(0);
    };
    /**
     * Adds the given <code>wall</code> to the set of walls of this home.
     * Once the <code>wall</code> is added, wall listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {Wall} wall  the wall to add
     */
    Home.prototype.addWall = function (wall) {
        this.walls = (this.walls.slice(0));
        /* add */ this.walls.push(wall);
        wall.setLevel(this.selectedLevel);
        this.wallsChangeSupport.fireCollectionChanged(wall, CollectionEvent.Type.ADD);
    };
    /**
     * Removes the given <code>wall</code> from the set of walls of this home.
     * Once the <code>wall</code> is removed, wall listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#DELETE}.
     * If any wall is attached to <code>wall</code> they will be detached from it.
     * @param {Wall} wall  the wall to remove
     */
    Home.prototype.deleteWall = function (wall) {
        this.deselectItem(wall);
        {
            var array193 = this.getWalls();
            for (var index192 = 0; index192 < array193.length; index192++) {
                var otherWall = array193[index192];
                {
                    if ((function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(wall, otherWall.getWallAtStart())) {
                        otherWall.setWallAtStart(null);
                    }
                    else if ((function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(wall, otherWall.getWallAtEnd())) {
                        otherWall.setWallAtEnd(null);
                    }
                }
            }
        }
        var index = this.walls.indexOf(wall);
        if (index !== -1) {
            wall.setLevel(null);
            this.walls = (this.walls.slice(0));
            /* remove */ this.walls.splice(index, 1);
            this.wallsChangeSupport.fireCollectionChanged(wall, CollectionEvent.Type.DELETE);
        }
    };
    /**
     * Adds the polyline <code>listener</code> in parameter to this home.
     * @param {CollectionListener} listener the listener to add
     * @since 5.0
     */
    Home.prototype.addPolylinesListener = function (listener) {
        this.polylinesChangeSupport.addCollectionListener((listener));
    };
    /**
     * Removes the polyline <code>listener</code> in parameter from this home.
     * @param {CollectionListener} listener the listener to remove
     * @since 5.0
     */
    Home.prototype.removePolylinesListener = function (listener) {
        this.polylinesChangeSupport.removeCollectionListener((listener));
    };
    /**
     * Returns an unmodifiable collection of the polylines of this home.
     * @since 5.0
     * @return {Array}
     */
    Home.prototype.getPolylines = function () {
        return this.polylines.slice(0);
    };
    /**
     * Adds a given <code>polyline</code> at the end of the polylines list of this home.
     * Once the <code>polyline</code> is added, polyline listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {Polyline} polyline  the polyline to add
     * @since 5.0
     */
    Home.prototype.addPolyline$com_eteks_sweethome3d_model_Polyline = function (polyline) {
        this.addPolyline$com_eteks_sweethome3d_model_Polyline$int(polyline, /* size */ this.polylines.length);
    };
    /**
     * Adds a <code>polyline</code> at a given <code>index</code> of the set of polylines of this home.
     * Once the <code>polyline</code> is added, polyline listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {Polyline} polyline  the polyline to add
     * @param {number} index  the index at which the polyline will be added
     * @since 5.0
     */
    Home.prototype.addPolyline$com_eteks_sweethome3d_model_Polyline$int = function (polyline, index) {
        this.polylines = (this.polylines.slice(0));
        /* add */ this.polylines.splice(index, 0, polyline);
        polyline.setLevel(this.selectedLevel);
        this.polylinesChangeSupport.fireCollectionChanged(polyline, CollectionEvent.Type.ADD);
    };
    /**
     * Adds a <code>polyline</code> at a given <code>index</code> of the set of polylines of this home.
     * Once the <code>polyline</code> is added, polyline listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {Polyline} polyline  the polyline to add
     * @param {number} index  the index at which the polyline will be added
     * @since 5.0
     */
    Home.prototype.addPolyline = function (polyline, index) {
        if (((polyline != null && polyline instanceof Polyline) || polyline === null) && ((typeof index === 'number') || index === null)) {
            return this.addPolyline$com_eteks_sweethome3d_model_Polyline$int(polyline, index);
        }
        else if (((polyline != null && polyline instanceof Polyline) || polyline === null) && index === undefined) {
            return this.addPolyline$com_eteks_sweethome3d_model_Polyline(polyline);
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Removes a given <code>polyline</code> from the set of polylines of this home.
     * Once the <code>polyline</code> is removed, polyline listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#DELETE}.
     * @param {Polyline} polyline  the polyline to remove
     * @since 5.0
     */
    Home.prototype.deletePolyline = function (polyline) {
        this.deselectItem(polyline);
        var index = this.polylines.indexOf(polyline);
        if (index !== -1) {
            polyline.setLevel(null);
            this.polylines = (this.polylines.slice(0));
            /* remove */ this.polylines.splice(index, 1);
            this.polylinesChangeSupport.fireCollectionChanged(polyline, CollectionEvent.Type.DELETE);
        }
    };
    /**
     * Adds the dimension line <code>listener</code> in parameter to this home.
     * @param {CollectionListener} listener the listener to add
     */
    Home.prototype.addDimensionLinesListener = function (listener) {
        this.dimensionLinesChangeSupport.addCollectionListener((listener));
    };
    /**
     * Removes the dimension line <code>listener</code> in parameter from this home.
     * @param {CollectionListener} listener the listener to remove
     */
    Home.prototype.removeDimensionLinesListener = function (listener) {
        this.dimensionLinesChangeSupport.removeCollectionListener((listener));
    };
    /**
     * Returns an unmodifiable collection of the dimension lines of this home.
     * @return {Array}
     */
    Home.prototype.getDimensionLines = function () {
        return this.dimensionLines.slice(0);
    };
    /**
     * Adds the given dimension line to the set of dimension lines of this home.
     * Once <code>dimensionLine</code> is added, dimension line listeners added
     * to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {DimensionLine} dimensionLine  the dimension line to add
     */
    Home.prototype.addDimensionLine = function (dimensionLine) {
        this.dimensionLines = (this.dimensionLines.slice(0));
        /* add */ this.dimensionLines.push(dimensionLine);
        dimensionLine.setLevel(this.selectedLevel);
        this.dimensionLinesChangeSupport.fireCollectionChanged(dimensionLine, CollectionEvent.Type.ADD);
    };
    /**
     * Removes the given dimension line from the set of dimension lines of this home.
     * Once <code>dimensionLine</code> is removed, dimension line listeners added
     * to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#DELETE}.
     * @param {DimensionLine} dimensionLine  the dimension line to remove
     */
    Home.prototype.deleteDimensionLine = function (dimensionLine) {
        this.deselectItem(dimensionLine);
        var index = this.dimensionLines.indexOf(dimensionLine);
        if (index !== -1) {
            dimensionLine.setLevel(null);
            this.dimensionLines = (this.dimensionLines.slice(0));
            /* remove */ this.dimensionLines.splice(index, 1);
            this.dimensionLinesChangeSupport.fireCollectionChanged(dimensionLine, CollectionEvent.Type.DELETE);
        }
    };
    /**
     * Adds the label <code>listener</code> in parameter to this home.
     * @param {CollectionListener} listener the listener to add
     */
    Home.prototype.addLabelsListener = function (listener) {
        this.labelsChangeSupport.addCollectionListener((listener));
    };
    /**
     * Removes the label <code>listener</code> in parameter from this home.
     * @param {CollectionListener} listener the listener to remove
     */
    Home.prototype.removeLabelsListener = function (listener) {
        this.labelsChangeSupport.removeCollectionListener((listener));
    };
    /**
     * Returns an unmodifiable collection of the labels of this home.
     * @return {Array}
     */
    Home.prototype.getLabels = function () {
        return this.labels.slice(0);
    };
    /**
     * Adds the given label to the set of labels of this home.
     * Once <code>label</code> is added, label listeners added
     * to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#ADD}.
     * @param {Label} label  the label to add
     */
    Home.prototype.addLabel = function (label) {
        this.labels = (this.labels.slice(0));
        /* add */ this.labels.push(label);
        label.setLevel(this.selectedLevel);
        this.labelsChangeSupport.fireCollectionChanged(label, CollectionEvent.Type.ADD);
    };
    /**
     * Removes the given label from the set of labels of this home.
     * Once <code>label</code> is removed, label listeners added to this home will receive a
     * {@link CollectionListener#collectionChanged(CollectionEvent) collectionChanged}
     * notification, with an {@link CollectionEvent#getType() event type}
     * equal to {@link CollectionEvent.Type#DELETE}.
     * @param {Label} label  the label to remove
     */
    Home.prototype.deleteLabel = function (label) {
        this.deselectItem(label);
        var index = this.labels.indexOf(label);
        if (index !== -1) {
            label.setLevel(null);
            this.labels = (this.labels.slice(0));
            /* remove */ this.labels.splice(index, 1);
            this.labelsChangeSupport.fireCollectionChanged(label, CollectionEvent.Type.DELETE);
        }
    };
    /**
     * Returns all the selectable and viewable items in this home, except the observer camera.
     * @return {Array} a list containing viewable walls, furniture, dimension lines, labels and compass.
     * @since 5.0
     */
    Home.prototype.getSelectableViewableItems = function () {
        var homeItems = ([]);
        this.addViewableItems(this.walls, homeItems);
        this.addViewableItems(this.rooms, homeItems);
        this.addViewableItems(this.dimensionLines, homeItems);
        this.addViewableItems(this.polylines, homeItems);
        this.addViewableItems(this.labels, homeItems);
        {
            var array195 = this.getFurniture();
            for (var index194 = 0; index194 < array195.length; index194++) {
                var piece = array195[index194];
                {
                    if (piece.isVisible() && (piece.getLevel() == null || piece.getLevel().isViewable())) {
                        /* add */ homeItems.push(piece);
                    }
                }
            }
        }
        if (this.getCompass().isVisible()) {
            /* add */ homeItems.push(this.getCompass());
        }
        return homeItems;
    };
    /**
     * Adds the viewable items to the set of selectable viewable items.
     * @param {Array} items
     * @param {Array} selectableViewableItems
     * @private
     */
    Home.prototype.addViewableItems = function (items, selectableViewableItems) {
        for (var index196 = 0; index196 < items.length; index196++) {
            var item = items[index196];
            {
                if (item != null && (item["__interfaces"] != null && item["__interfaces"].indexOf("com.eteks.sweethome3d.model.Elevatable") >= 0 || item.constructor != null && item.constructor["__interfaces"] != null && item.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Elevatable") >= 0)) {
                    var elevatableItem = item;
                    if (elevatableItem.getLevel() == null || elevatableItem.getLevel().isViewable()) {
                        /* add */ selectableViewableItems.push(item);
                    }
                }
            }
        }
    };
    /**
     * Returns <code>true</code> if this home doesn't contain any item i.e.
     * no piece of furniture, no wall, no room, no dimension line and no label.
     * @since 2.2
     * @return {boolean}
     */
    Home.prototype.isEmpty = function () {
        return (this.furniture.length == 0) && (this.walls.length == 0) && (this.rooms.length == 0) && (this.dimensionLines.length == 0) && (this.polylines.length == 0) && (this.labels.length == 0);
    };
    /**
     * Adds the property change <code>listener</code> in parameter to this home.
     * @param {string} property the property to follow
     * @param {PropertyChangeListener} listener the listener to add
     */
    Home.prototype.addPropertyChangeListener = function (property, listener) {
        this.propertyChangeSupport.addPropertyChangeListener(/* name */ property, listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this home.
     * @param {string} property the followed property
     * @param {PropertyChangeListener} listener the listener to remove
     */
    Home.prototype.removePropertyChangeListener = function (property, listener) {
        this.propertyChangeSupport.removePropertyChangeListener(/* name */ property, listener);
    };
    /**
     * Returns the wall height of this home.
     * @return {number}
     */
    Home.prototype.getWallHeight = function () {
        return this.wallHeight;
    };
    /**
     * Returns the name of this home.
     * @return {string}
     */
    Home.prototype.getName = function () {
        return this.name;
    };
    /**
     * Sets the name of this home and fires a <code>PropertyChangeEvent</code>.
     * @param {string} name  the new name of this home
     */
    Home.prototype.setName = function (name) {
        if (name !== this.name && (name == null || !(name === this.name))) {
            var oldName = this.name;
            this.name = name;
            this.propertyChangeSupport.firePropertyChange(/* name */ "NAME", oldName, name);
        }
    };
    /**
     * Returns whether the state of this home is modified or not.
     * @return {boolean}
     */
    Home.prototype.isModified = function () {
        return this.modified;
    };
    /**
     * Sets the modified state of this home and fires a <code>PropertyChangeEvent</code>.
     * @param {boolean} modified
     */
    Home.prototype.setModified = function (modified) {
        if (modified !== this.modified) {
            this.modified = modified;
            this.propertyChangeSupport.firePropertyChange(/* name */ "MODIFIED", !modified, modified);
        }
    };
    /**
     * Returns whether this home was recovered or not.
     * @since 3.0
     * @return {boolean}
     */
    Home.prototype.isRecovered = function () {
        return this.recovered;
    };
    /**
     * Sets whether this home was recovered or not and fires a <code>PropertyChangeEvent</code>.
     * @since 3.0
     * @param {boolean} recovered
     */
    Home.prototype.setRecovered = function (recovered) {
        if (recovered !== this.recovered) {
            this.recovered = recovered;
            this.propertyChangeSupport.firePropertyChange(/* name */ "RECOVERED", !recovered, recovered);
        }
    };
    /**
     * Returns whether this home was repaired or not.
     * @since 4.4
     * @return {boolean}
     */
    Home.prototype.isRepaired = function () {
        return this.repaired;
    };
    /**
     * Sets whether this home is repaired or not and fires a <code>PropertyChangeEvent</code>.
     * @since 4.4
     * @param {boolean} repaired
     */
    Home.prototype.setRepaired = function (repaired) {
        if (repaired !== this.repaired) {
            this.repaired = repaired;
            this.propertyChangeSupport.firePropertyChange(/* name */ "REPAIRED", !repaired, repaired);
        }
    };
    /**
     * Returns the furniture property on which home is sorted or <code>null</code> if
     * home furniture isn't sorted.
     * @return {string}
     */
    Home.prototype.getFurnitureSortedProperty = function () {
        return this.furnitureSortedProperty;
    };
    /**
     * Sets the furniture property on which this home should be sorted
     * and fires a <code>PropertyChangeEvent</code>.
     * @param {string} furnitureSortedProperty the new property
     */
    Home.prototype.setFurnitureSortedProperty = function (furnitureSortedProperty) {
        if (furnitureSortedProperty !== this.furnitureSortedProperty && (furnitureSortedProperty == null || !(furnitureSortedProperty == this.furnitureSortedProperty))) {
            var oldFurnitureSortedProperty = this.furnitureSortedProperty;
            this.furnitureSortedProperty = furnitureSortedProperty;
            this.propertyChangeSupport.firePropertyChange(/* name */ "FURNITURE_SORTED_PROPERTY", oldFurnitureSortedProperty, furnitureSortedProperty);
        }
    };
    /**
     * Returns whether furniture is sorted in ascending or descending order.
     * @return {boolean}
     */
    Home.prototype.isFurnitureDescendingSorted = function () {
        return this.furnitureDescendingSorted;
    };
    /**
     * Sets the furniture sort order on which home should be sorted
     * and fires a <code>PropertyChangeEvent</code>.
     * @param {boolean} furnitureDescendingSorted
     */
    Home.prototype.setFurnitureDescendingSorted = function (furnitureDescendingSorted) {
        if (furnitureDescendingSorted !== this.furnitureDescendingSorted) {
            this.furnitureDescendingSorted = furnitureDescendingSorted;
            this.propertyChangeSupport.firePropertyChange(/* name */ "FURNITURE_DESCENDING_SORTED", !furnitureDescendingSorted, furnitureDescendingSorted);
        }
    };
    /**
     * Returns an unmodifiable list of the furniture properties that are visible.
     * @return {Array}
     */
    Home.prototype.getFurnitureVisibleProperties = function () {
        if (this.furnitureVisibleProperties == null) {
            return [];
        }
        else {
            return this.furnitureVisibleProperties.slice(0);
        }
    };
    /**
     * Sets the furniture properties that are visible and the order in which they are visible,
     * then fires a <code>PropertyChangeEvent</code>.
     * @param {Array} furnitureVisibleProperties  the properties to display
     */
    Home.prototype.setFurnitureVisibleProperties = function (furnitureVisibleProperties) {
        if (furnitureVisibleProperties !== this.furnitureVisibleProperties && (furnitureVisibleProperties == null || !(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(furnitureVisibleProperties, this.furnitureVisibleProperties))) {
            var oldFurnitureVisibleProperties = this.furnitureVisibleProperties;
            this.furnitureVisibleProperties = (furnitureVisibleProperties.slice(0));
            this.propertyChangeSupport.firePropertyChange(/* name */ "FURNITURE_VISIBLE_PROPERTIES", /* unmodifiableList */ oldFurnitureVisibleProperties.slice(0), /* unmodifiableList */ furnitureVisibleProperties.slice(0));
        }
    };
    /**
     * Returns the plan background image of this home.
     * @return {BackgroundImage}
     */
    Home.prototype.getBackgroundImage = function () {
        return this.backgroundImage;
    };
    /**
     * Sets the plan background image of this home and fires a <code>PropertyChangeEvent</code>.
     * @param {BackgroundImage} backgroundImage  the new background image
     */
    Home.prototype.setBackgroundImage = function (backgroundImage) {
        if (backgroundImage !== this.backgroundImage) {
            var oldBackgroundImage = this.backgroundImage;
            this.backgroundImage = backgroundImage;
            this.propertyChangeSupport.firePropertyChange(/* name */ "BACKGROUND_IMAGE", oldBackgroundImage, backgroundImage);
        }
    };
    /**
     * Returns the camera used to display this home from a top point of view.
     * @return {Camera}
     */
    Home.prototype.getTopCamera = function () {
        return this.topCamera;
    };
    /**
     * Returns the camera used to display this home from an observer point of view.
     * @return {ObserverCamera}
     */
    Home.prototype.getObserverCamera = function () {
        return this.observerCamera;
    };
    /**
     * Sets the camera used to display this home and fires a <code>PropertyChangeEvent</code>.
     * @param {Camera} camera  the camera to use
     */
    Home.prototype.setCamera = function (camera) {
        if (camera !== this.camera) {
            var oldCamera = this.camera;
            this.camera = camera;
            this.propertyChangeSupport.firePropertyChange(/* name */ "CAMERA", oldCamera, camera);
        }
    };
    /**
     * Returns the camera used to display this home.
     * @return {Camera}
     */
    Home.prototype.getCamera = function () {
        if (this.camera == null) {
            this.camera = this.getTopCamera();
        }
        return this.camera;
    };
    /**
     * Sets the cameras stored by this home and fires a <code>PropertyChangeEvent</code>.
     * The list given as parameter is cloned but not the camera instances it contains.
     * @param {Array} storedCameras  the new list of cameras
     * @since 3.0
     */
    Home.prototype.setStoredCameras = function (storedCameras) {
        if (!(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(this.storedCameras, storedCameras)) {
            var oldStoredCameras = this.storedCameras;
            if (storedCameras == null) {
                this.storedCameras = [];
            }
            else {
                this.storedCameras = (storedCameras.slice(0));
            }
            this.propertyChangeSupport.firePropertyChange(/* name */ "STORED_CAMERAS", /* unmodifiableList */ oldStoredCameras.slice(0), /* unmodifiableList */ storedCameras.slice(0));
        }
    };
    /**
     * Returns an unmodifiable list of the cameras stored by this home.
     * @since 3.0
     * @return {Array}
     */
    Home.prototype.getStoredCameras = function () {
        return this.storedCameras.slice(0);
    };
    /**
     * Returns the environment attributes of this home.
     * @return {HomeEnvironment}
     */
    Home.prototype.getEnvironment = function () {
        return this.environment;
    };
    /**
     * Returns the compass associated to this home.
     * @since 3.0
     * @return {Compass}
     */
    Home.prototype.getCompass = function () {
        return this.compass;
    };
    /**
     * Returns the print attributes of this home.
     * @return {HomePrint}
     */
    Home.prototype.getPrint = function () {
        return this.print;
    };
    /**
     * Sets the print attributes of this home and fires a <code>PropertyChangeEvent</code>.
     * @param {HomePrint} print  the new print attributes
     */
    Home.prototype.setPrint = function (print) {
        if (print !== this.print) {
            var oldPrint = this.print;
            this.print = print;
            this.propertyChangeSupport.firePropertyChange(/* name */ "PRINT", oldPrint, print);
        }
        this.print = print;
    };
    /**
     * Returns the value of the property <code>name</code> associated with this home.
     * @return {string} the value of the property or <code>null</code> if it doesn't exist.
     * @since 5.2
     * @param {string} name
     */
    Home.prototype.getProperty = function (name) {
        return (function (m, k) { return m[k] ? m[k] : null; })(this.properties, name);
    };
    /**
     * Returns the numeric value of the property <code>name</code> associated with this home.
     * @return {number} an instance of {@link Long}, {@link Double} or <code>null</code> if the property
     * doesn't exist or can't be parsed.
     * @since 5.2
     * @param {string} name
     */
    Home.prototype.getNumericProperty = function (name) {
        var value = (function (m, k) { return m[k] ? m[k] : null; })(this.properties, name);
        if (value != null) {
            try {
                return new Number(value).valueOf();
            }
            catch (ex) {
                try {
                    return new Number(value).valueOf();
                }
                catch (ex1) {
                }
                ;
            }
            ;
        }
        return null;
    };
    /**
     * Sets a property associated with this home.
     * @param {string} name   the name of the property to set
     * @param {string} value  the new value of the property
     * @since 5.2
     */
    Home.prototype.setProperty = function (name, value) {
        if (value == null) {
            if (this.properties.hasOwnProperty(name)) {
                /* remove */ delete this.properties[name];
            }
        }
        else {
            /* put */ (this.properties[name] = value);
        }
    };
    /**
     * Returns the property names.
     * @return {Array} a collection of all the names of the properties set with {@link #setProperty(String, String) setProperty}
     * @since 5.2
     */
    Home.prototype.getPropertyNames = function () {
        return Object.keys(this.properties);
    };
    /**
     * Returns <code>true</code> if the home objects belonging to the base plan
     * (generally walls, rooms, dimension lines and texts) are locked.
     * @since 1.8
     * @return {boolean}
     */
    Home.prototype.isBasePlanLocked = function () {
        return this.basePlanLocked;
    };
    /**
     * Sets whether home objects belonging to the base plan (generally walls, rooms,
     * dimension lines and texts) are locked and fires a <code>PropertyChangeEvent</code>.
     * @since 1.8
     * @param {boolean} basePlanLocked
     */
    Home.prototype.setBasePlanLocked = function (basePlanLocked) {
        if (basePlanLocked !== this.basePlanLocked) {
            this.basePlanLocked = basePlanLocked;
            this.propertyChangeSupport.firePropertyChange(/* name */ "BASE_PLAN_LOCKED", !basePlanLocked, basePlanLocked);
        }
    };
    /**
     * Returns the version of this home, the last time it was serialized or
     * or {@link #CURRENT_VERSION} if it is not serialized yet or
     * was serialized with Sweet Home 3D 0.x.
     * Version is useful to know with which Sweet Home 3D version this home was saved
     * and warn user that he may lose information if he saves with
     * current application a home created by a more recent version.
     * @return {number}
     */
    Home.prototype.getVersion = function () {
        return this.version;
    };
    /**
     * Sets the version of this home.
     * @return {void} version  the new version
     * @since 5.2
     * @param {number} version
     */
    Home.prototype.setVersion = function (version) {
        this.version = version;
    };
    /**
     * Returns a clone of this home and the objects it contains.
     * Listeners bound to this home aren't added to the returned home.
     * @since 2.3
     * @return {Home}
     */
    Home.prototype.clone = function () {
        try {
            var clone = (function (o) { var clone = Object.create(o); for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone[p] = o[p];
            } return clone; })(this);
            Home.copyHomeData(this, clone);
            Home.initListenersSupport(clone);
            clone.addModelListeners();
            return clone;
        }
        catch (ex) {
            throw new IllegalStateException("Super class isn\'t cloneable");
        }
        ;
    };
    /**
     * Copies all data of a <code>source</code> home to a <code>destination</code> home.
     * @param {Home} source
     * @param {Home} destination
     * @private
     */
    Home.copyHomeData = function (source, destination) {
        destination.allLevelsSelection = source.allLevelsSelection;
        destination.name = source.name;
        destination.modified = source.modified;
        destination.recovered = source.recovered;
        destination.repaired = source.repaired;
        destination.backgroundImage = source.backgroundImage;
        destination.print = source.print;
        destination.furnitureDescendingSorted = source.furnitureDescendingSorted;
        destination.version = source.version;
        destination.basePlanLocked = source.basePlanLocked;
        destination.skyColor = source.skyColor;
        destination.groundColor = source.groundColor;
        destination.lightColor = source.lightColor;
        destination.wallsAlpha = source.wallsAlpha;
        destination.furnitureSortedProperty = source.furnitureSortedProperty;
        destination.selectedItems = ([]);
        destination.furniture = Home.cloneSelectableItems(source.furniture, source.selectedItems, destination.selectedItems);
        for (var i = 0; i < source.furniture.length; i++) {
            var piece = source.furniture[i];
            if ((piece != null && piece instanceof HomeDoorOrWindow) && piece.isBoundToWall()) {
                destination.furniture[i].setBoundToWall(true);
            }
        }
        destination.rooms = Home.cloneSelectableItems(source.rooms, source.selectedItems, destination.selectedItems);
        destination.dimensionLines = Home.cloneSelectableItems(source.dimensionLines, source.selectedItems, destination.selectedItems);
        destination.polylines = Home.cloneSelectableItems(source.polylines, source.selectedItems, destination.selectedItems);
        destination.labels = Home.cloneSelectableItems(source.labels, source.selectedItems, destination.selectedItems);
        destination.walls = Wall.clone(source.walls);
        for (var i = 0; i < source.walls.length; i++) {
            var wall = source.walls[i];
            if ((source.selectedItems.indexOf(wall) >= 0)) {
                /* add */ destination.selectedItems.push(/* get */ destination.walls[i]);
            }
        }
        destination.levels = ([]);
        if (source.levels.length > 0) {
            for (var index197 = 0; index197 < source.levels.length; index197++) {
                var level = source.levels[index197];
                {
                    /* add */ destination.levels.push(/* clone */ /* clone */ (function (o) { if (o.clone != undefined) {
                        return o.clone();
                    }
                    else {
                        var clone = Object.create(o);
                        for (var p in o) {
                            if (o.hasOwnProperty(p))
                                clone[p] = o[p];
                        }
                        return clone;
                    } })(level));
                }
            }
            for (var i = 0; i < source.furniture.length; i++) {
                var pieceLevel = source.furniture[i].getLevel();
                if (pieceLevel != null) {
                    /* get */ destination.furniture[i].setLevel(/* get */ destination.levels[source.levels.indexOf(pieceLevel)]);
                }
            }
            for (var i = 0; i < source.rooms.length; i++) {
                var roomLevel = source.rooms[i].getLevel();
                if (roomLevel != null) {
                    /* get */ destination.rooms[i].setLevel(/* get */ destination.levels[source.levels.indexOf(roomLevel)]);
                }
            }
            for (var i = 0; i < source.dimensionLines.length; i++) {
                var dimensionLineLevel = source.dimensionLines[i].getLevel();
                if (dimensionLineLevel != null) {
                    /* get */ destination.dimensionLines[i].setLevel(/* get */ destination.levels[source.levels.indexOf(dimensionLineLevel)]);
                }
            }
            for (var i = 0; i < source.polylines.length; i++) {
                var polylineLevel = source.polylines[i].getLevel();
                if (polylineLevel != null) {
                    /* get */ destination.polylines[i].setLevel(/* get */ destination.levels[source.levels.indexOf(polylineLevel)]);
                }
            }
            for (var i = 0; i < source.labels.length; i++) {
                var labelLevel = source.labels[i].getLevel();
                if (labelLevel != null) {
                    /* get */ destination.labels[i].setLevel(/* get */ destination.levels[source.levels.indexOf(labelLevel)]);
                }
            }
            for (var i = 0; i < source.walls.length; i++) {
                var wallLevel = source.walls[i].getLevel();
                if (wallLevel != null) {
                    /* get */ destination.walls[i].setLevel(/* get */ destination.levels[source.levels.indexOf(wallLevel)]);
                }
            }
            if (source.selectedLevel != null) {
                destination.selectedLevel = destination.levels[source.levels.indexOf(source.selectedLevel)];
            }
        }
        destination.observerCamera = (function (o) { if (o.clone != undefined) {
            return o.clone();
        }
        else {
            var clone = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone[p] = o[p];
            }
            return clone;
        } })(source.observerCamera);
        destination.topCamera = (function (o) { if (o.clone != undefined) {
            return o.clone();
        }
        else {
            var clone = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone[p] = o[p];
            }
            return clone;
        } })(source.topCamera);
        if (source.camera === source.observerCamera) {
            destination.camera = destination.observerCamera;
            if ((source.selectedItems.indexOf(source.observerCamera) >= 0)) {
                /* add */ destination.selectedItems.push(destination.observerCamera);
            }
        }
        else {
            destination.camera = destination.topCamera;
        }
        destination.storedCameras = ([]);
        for (var index198 = 0; index198 < source.storedCameras.length; index198++) {
            var camera = source.storedCameras[index198];
            {
                /* add */ destination.storedCameras.push(/* clone */ /* clone */ (function (o) { if (o.clone != undefined) {
                    return o.clone();
                }
                else {
                    var clone = Object.create(o);
                    for (var p in o) {
                        if (o.hasOwnProperty(p))
                            clone[p] = o[p];
                    }
                    return clone;
                } })(camera));
            }
        }
        destination.environment = (function (o) { if (o.clone != undefined) {
            return o.clone();
        }
        else {
            var clone = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone[p] = o[p];
            }
            return clone;
        } })(source.environment);
        destination.compass = (function (o) { if (o.clone != undefined) {
            return o.clone();
        }
        else {
            var clone = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone[p] = o[p];
            }
            return clone;
        } })(source.compass);
        destination.furnitureVisibleProperties = (source.furnitureVisibleProperties.slice(0));
        destination.visualProperties = ({});
        destination.properties = ({});
    };
    /**
     * Returns the list of cloned items in <code>source</code>.
     * If a cloned item is selected its clone will be selected too (ie added to
     * <code>destinationSelectedItems</code>).
     * @param {Array} source
     * @param {Array} sourceSelectedItems
     * @param {Array} destinationSelectedItems
     * @return {Array}
     * @private
     */
    Home.cloneSelectableItems = function (source, sourceSelectedItems, destinationSelectedItems) {
        var destination = ([]);
        for (var index199 = 0; index199 < source.length; index199++) {
            var item = source[index199];
            {
                var clone = (function (o) { if (o.clone != undefined) {
                    return o.clone();
                }
                else {
                    var clone_11 = Object.create(o);
                    for (var p in o) {
                        if (o.hasOwnProperty(p))
                            clone_11[p] = o[p];
                    }
                    return clone_11;
                } })(item);
                /* add */ destination.push(clone);
                if ((sourceSelectedItems.indexOf(item) >= 0)) {
                    /* add */ destinationSelectedItems.push(clone);
                }
                else if (item != null && item instanceof HomeFurnitureGroup) {
                    var sourceFurnitureGroup = item.getAllFurniture();
                    var destinationFurnitureGroup = null;
                    for (var i = 0, n = sourceFurnitureGroup.length; i < n; i++) {
                        var piece = sourceFurnitureGroup[i];
                        if ((sourceSelectedItems.indexOf(piece) >= 0)) {
                            if (destinationFurnitureGroup == null) {
                                destinationFurnitureGroup = clone.getAllFurniture();
                            }
                            /* add */ destinationSelectedItems.push(/* get */ destinationFurnitureGroup[i]);
                        }
                    }
                }
            }
        }
        return destination;
    };
    /**
     * Returns a deep copy of home selectable <code>items</code>.
     * @param {Array} items  the items to duplicate
     * @return {Array}
     */
    Home.duplicate = function (items) {
        var list = ([]);
        for (var index200 = 0; index200 < items.length; index200++) {
            var item = items[index200];
            {
                if (!(item != null && item instanceof Wall) && !(item != null && item instanceof Camera) && !(item != null && item instanceof Compass)) {
                    /* add */ list.push(/* clone */ /* clone */ (function (o) { if (o.clone != undefined) {
                        return o.clone();
                    }
                    else {
                        var clone = Object.create(o);
                        for (var p in o) {
                            if (o.hasOwnProperty(p))
                                clone[p] = o[p];
                        }
                        return clone;
                    } })(item));
                }
            }
        }
        /* addAll */ (function (l1, l2) { return l1.push.apply(l1, l2); })(list, /* clone */ Wall.clone(Home.getWallsSubList(items)));
        return list;
    };
    /**
     * Returns a sub list of <code>items</code> that contains only home furniture.
     * @param {Array} items  the items among which the search is done
     * @return {Array}
     */
    Home.getFurnitureSubList = function (items) {
        return Home.getSubList(items, HomePieceOfFurniture);
    };
    /**
     * Returns a sub list of <code>items</code> that contains only walls.
     * @param {Array} items  the items among which the search is done
     * @return {Array}
     */
    Home.getWallsSubList = function (items) {
        return Home.getSubList(items, Wall);
    };
    /**
     * Returns a sub list of <code>items</code> that contains only rooms.
     * @param {Array} items  the items among which the search is done
     * @return {Array}
     */
    Home.getRoomsSubList = function (items) {
        return Home.getSubList(items, Room);
    };
    /**
     * Returns a sub list of <code>items</code> that contains only labels.
     * @param {Array} items  the items among which the search is done
     * @since 5.0
     * @return {Array}
     */
    Home.getPolylinesSubList = function (items) {
        return Home.getSubList(items, Polyline);
    };
    /**
     * Returns a sub list of <code>items</code> that contains only dimension lines.
     * @param {Array} items  the items among which the search is done
     * @return {Array}
     */
    Home.getDimensionLinesSubList = function (items) {
        return Home.getSubList(items, DimensionLine);
    };
    /**
     * Returns a sub list of <code>items</code> that contains only labels.
     * @param {Array} items  the items among which the search is done
     * @return {Array}
     */
    Home.getLabelsSubList = function (items) {
        return Home.getSubList(items, Label);
    };
    /**
     * Returns a sub list of <code>items</code> that contains only instances of <code>subListClass</code>.
     * @param {Array} items         the items among which the search is done
     * @param {Function<>} subListClass  the class of the searched items
     * @since 2.2
     * @return {Array}
     */
    Home.getSubList = function (items, subListClass) {
        var subList = ([]);
        for (var index201 = 0; index201 < items.length; index201++) {
            var item = items[index201];
            {
                if (subListClass.isInstance(item)) {
                    /* add */ subList.push(item);
                }
            }
        }
        return subList;
    };
    return Home;
}());
/**
 * The current version of this home. Each time the field list is changed
 * in <code>Home</code> class or in one of the classes that it uses,
 * this number is increased.
 */
Home.CURRENT_VERSION = 5300;
Home.KEEP_BACKWARD_COMPATIBLITY = true;
Home["__class"] = "Home";
Home["__interfaces"] = ["java.lang.Cloneable", "java.io.Serializable"];
(function (Home) {
    var Home$0 = (function () {
        function Home$0(__parent) {
            this.__parent = __parent;
        }
        Home$0.prototype.propertyChange = function (ev) {
            if (("ELEVATION" === ev.getPropertyName()) || ("ELEVATION_INDEX" === ev.getPropertyName())) {
                this.__parent.levels = (this.__parent.levels.slice(0));
                /* sort */ this.__parent.levels.sort(Home.LEVEL_ELEVATION_COMPARATOR_$LI$());
            }
        };
        return Home$0;
    }());
    Home.Home$0 = Home$0;
})(Home || (Home = {}));
/**
 * Creates a home door or window from an existing one.
 * @param {DoorOrWindow} doorOrWindow the door or window from which data are copied
 * @class
 */
var HomeDoorOrWindow = (function (_super) {
    __extends(HomeDoorOrWindow, _super);
    function HomeDoorOrWindow(doorOrWindow) {
        var _this = _super.call(this, doorOrWindow) || this;
        _this.wallThickness = 0;
        _this.wallDistance = 0;
        _this.sashes = null;
        _this.cutOutShape = null;
        _this.boundToWall = false;
        _this.wallThickness = doorOrWindow.getWallThickness();
        _this.wallDistance = doorOrWindow.getWallDistance();
        _this.sashes = doorOrWindow.getSashes();
        _this.cutOutShape = doorOrWindow.getCutOutShape();
        return _this;
    }
    /**
     * Returns the default thickness of the wall in which this door or window should be placed.
     * @return {number} a value in percentage of the depth of the door or the window.
     */
    HomeDoorOrWindow.prototype.getWallThickness = function () {
        return this.wallThickness;
    };
    /**
     * Returns the default distance that should lie at the back side of this door or window.
     * @return {number} a distance in percentage of the depth of the door or the window.
     */
    HomeDoorOrWindow.prototype.getWallDistance = function () {
        return this.wallDistance;
    };
    /**
     * Returns a copy of the sashes attached to this door or window.
     * If no sash is defined an empty array is returned.
     * @return {Array}
     */
    HomeDoorOrWindow.prototype.getSashes = function () {
        if (this.sashes.length === 0) {
            return this.sashes;
        }
        else {
            return this.sashes.slice(0);
        }
    };
    /**
     * Returns the shape used to cut out walls that intersect this new door or window.
     * @since 4.2
     * @return {string}
     */
    HomeDoorOrWindow.prototype.getCutOutShape = function () {
        return this.cutOutShape;
    };
    /**
     * Returns <code>true</code> if the location and the size of this door or window
     * were bound to a wall, last time they were updated.
     * @return {boolean}
     */
    HomeDoorOrWindow.prototype.isBoundToWall = function () {
        return this.boundToWall;
    };
    /**
     * Sets whether the location and the size of this door or window
     * were bound to a wall, last time they were updated.
     * @param {boolean} boundToWall
     */
    HomeDoorOrWindow.prototype.setBoundToWall = function (boundToWall) {
        this.boundToWall = boundToWall;
    };
    /**
     * Sets the abscissa of this door or window and
     * resets its {@link #isBoundToWall() boundToWall} flag if the abscissa changed.
     * @param {number} x
     */
    HomeDoorOrWindow.prototype.setX = function (x) {
        if (this.getX() !== x) {
            this.boundToWall = false;
        }
        _super.prototype.setX.call(this, x);
    };
    /**
     * Sets the ordinate of this door or window and
     * resets its {@link #isBoundToWall() boundToWall} flag if the ordinate changed.
     * @param {number} y
     */
    HomeDoorOrWindow.prototype.setY = function (y) {
        if (this.getY() !== y) {
            this.boundToWall = false;
        }
        _super.prototype.setY.call(this, y);
    };
    /**
     * Sets the angle of this door or window and
     * resets its {@link #isBoundToWall() boundToWall} flag if the angle changed.
     * @param {number} angle
     */
    HomeDoorOrWindow.prototype.setAngle = function (angle) {
        if (this.getAngle() !== angle) {
            this.boundToWall = false;
        }
        _super.prototype.setAngle.call(this, angle);
    };
    /**
     * Sets the depth of this door or window and
     * resets its {@link #isBoundToWall() boundToWall} flag if the depth changed.
     * @param {number} depth
     */
    HomeDoorOrWindow.prototype.setDepth = function (depth) {
        if (this.getDepth() !== depth) {
            this.boundToWall = false;
        }
        _super.prototype.setDepth.call(this, depth);
    };
    /**
     * Returns always <code>true</code>.
     * @return {boolean}
     */
    HomeDoorOrWindow.prototype.isDoorOrWindow = function () {
        return true;
    };
    /**
     * Returns a clone of this door or window.
     * @return {HomeDoorOrWindow}
     */
    HomeDoorOrWindow.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_12 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_12[p] = o[p];
            }
            return clone_12;
        } })(this);
        clone.boundToWall = false;
        return clone;
    };
    return HomeDoorOrWindow;
}(HomePieceOfFurniture));
HomeDoorOrWindow["__class"] = "HomeDoorOrWindow";
HomeDoorOrWindow["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "com.eteks.sweethome3d.model.DoorOrWindow", "com.eteks.sweethome3d.model.PieceOfFurniture", "com.eteks.sweethome3d.model.Elevatable", "java.io.Serializable"];
/**
 * Creates a group from the given <code>furniture</code> list.
 * The level of each piece of furniture of the group will be reset to <code>null</code> and if they belong to levels
 * with different elevations, their elevation will be updated to be relative to the elevation of the lowest level.
 * @since 5.2
 * @param {Array} furniture
 * @param {number} angle
 * @param {boolean} modelMirrored
 * @param {string} name
 * @class
 */
var HomeFurnitureGroup = (function (_super) {
    __extends(HomeFurnitureGroup, _super);
    function HomeFurnitureGroup(furniture, angle, modelMirrored, name) {
        var _this = this;
        if (((furniture != null && (furniture instanceof Array)) || furniture === null) && ((typeof angle === 'number') || angle === null) && ((typeof modelMirrored === 'boolean') || modelMirrored === null) && ((typeof name === 'string') || name === null)) {
            var __args = Array.prototype.slice.call(arguments);
            _this = _super.call(this, /* get */ furniture[0]) || this;
            _this.furniture = null;
            _this.resizable = false;
            _this.deformable = false;
            _this.texturable = false;
            _this.doorOrWindow = false;
            _this.fixedWidth = 0;
            _this.fixedDepth = 0;
            _this.fixedHeight = 0;
            _this.dropOnTopElevation = 0;
            _this.currency = null;
            _this.furnitureListener = null;
            _this.furniture = null;
            _this.resizable = false;
            _this.deformable = false;
            _this.texturable = false;
            _this.doorOrWindow = false;
            _this.fixedWidth = 0;
            _this.fixedDepth = 0;
            _this.fixedHeight = 0;
            _this.dropOnTopElevation = 0;
            _this.currency = null;
            _this.furnitureListener = null;
            (function () {
                _this.furniture = furniture.slice(0);
                var movable = true;
                var visible = false;
                for (var index202 = 0; index202 < furniture.length; index202++) {
                    var piece = furniture[index202];
                    {
                        movable = movable && piece.isMovable();
                        visible = visible || piece.isVisible();
                    }
                }
                _this.setName(name);
                _this.setNameVisible(false);
                _this.setNameXOffset(0);
                _this.setNameYOffset(0);
                _this.setNameStyle(null);
                _this.setDescription(null);
                _super.prototype.setMovable.call(_this, movable);
                _this.setVisible(visible);
                _this.updateLocationAndSize(furniture, angle, true);
                _super.prototype.setAngle.call(_this, angle);
                _super.prototype.setModelMirrored.call(_this, modelMirrored);
                _this.addFurnitureListener();
            })();
        }
        else if (((furniture != null && (furniture instanceof Array)) || furniture === null) && ((angle != null && angle instanceof HomePieceOfFurniture) || angle === null) && ((typeof modelMirrored === 'string') || modelMirrored === null) && name === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var leadingPiece = __args[1];
            var name_5 = __args[2];
            {
                var __args_32 = Array.prototype.slice.call(arguments);
                var angle_2 = leadingPiece.getAngle();
                var modelMirrored_1 = false;
                _this = _super.call(this, /* get */ furniture[0]) || this;
                _this.furniture = null;
                _this.resizable = false;
                _this.deformable = false;
                _this.texturable = false;
                _this.doorOrWindow = false;
                _this.fixedWidth = 0;
                _this.fixedDepth = 0;
                _this.fixedHeight = 0;
                _this.dropOnTopElevation = 0;
                _this.currency = null;
                _this.furnitureListener = null;
                _this.furniture = null;
                _this.resizable = false;
                _this.deformable = false;
                _this.texturable = false;
                _this.doorOrWindow = false;
                _this.fixedWidth = 0;
                _this.fixedDepth = 0;
                _this.fixedHeight = 0;
                _this.dropOnTopElevation = 0;
                _this.currency = null;
                _this.furnitureListener = null;
                (function () {
                    _this.furniture = furniture.slice(0);
                    var movable = true;
                    var visible = false;
                    for (var index203 = 0; index203 < furniture.length; index203++) {
                        var piece = furniture[index203];
                        {
                            movable = movable && piece.isMovable();
                            visible = visible || piece.isVisible();
                        }
                    }
                    _this.setName(name_5);
                    _this.setNameVisible(false);
                    _this.setNameXOffset(0);
                    _this.setNameYOffset(0);
                    _this.setNameStyle(null);
                    _this.setDescription(null);
                    _super.prototype.setMovable.call(_this, movable);
                    _this.setVisible(visible);
                    _this.updateLocationAndSize(furniture, angle_2, true);
                    _super.prototype.setAngle.call(_this, angle_2);
                    _super.prototype.setModelMirrored.call(_this, modelMirrored_1);
                    _this.addFurnitureListener();
                })();
            }
        }
        else if (((furniture != null && (furniture instanceof Array)) || furniture === null) && ((typeof angle === 'string') || angle === null) && modelMirrored === undefined && name === undefined) {
            var __args = Array.prototype.slice.call(arguments);
            var name_6 = __args[1];
            {
                var __args_33 = Array.prototype.slice.call(arguments);
                var leadingPiece = __args_33[0][0];
                {
                    var __args_34 = Array.prototype.slice.call(arguments);
                    var angle_3 = leadingPiece.getAngle();
                    var modelMirrored_2 = false;
                    _this = _super.call(this, /* get */ furniture[0]) || this;
                    _this.furniture = null;
                    _this.resizable = false;
                    _this.deformable = false;
                    _this.texturable = false;
                    _this.doorOrWindow = false;
                    _this.fixedWidth = 0;
                    _this.fixedDepth = 0;
                    _this.fixedHeight = 0;
                    _this.dropOnTopElevation = 0;
                    _this.currency = null;
                    _this.furnitureListener = null;
                    _this.furniture = null;
                    _this.resizable = false;
                    _this.deformable = false;
                    _this.texturable = false;
                    _this.doorOrWindow = false;
                    _this.fixedWidth = 0;
                    _this.fixedDepth = 0;
                    _this.fixedHeight = 0;
                    _this.dropOnTopElevation = 0;
                    _this.currency = null;
                    _this.furnitureListener = null;
                    (function () {
                        _this.furniture = furniture.slice(0);
                        var movable = true;
                        var visible = false;
                        for (var index204 = 0; index204 < furniture.length; index204++) {
                            var piece = furniture[index204];
                            {
                                movable = movable && piece.isMovable();
                                visible = visible || piece.isVisible();
                            }
                        }
                        _this.setName(name_6);
                        _this.setNameVisible(false);
                        _this.setNameXOffset(0);
                        _this.setNameYOffset(0);
                        _this.setNameStyle(null);
                        _this.setDescription(null);
                        _super.prototype.setMovable.call(_this, movable);
                        _this.setVisible(visible);
                        _this.updateLocationAndSize(furniture, angle_3, true);
                        _super.prototype.setAngle.call(_this, angle_3);
                        _super.prototype.setModelMirrored.call(_this, modelMirrored_2);
                        _this.addFurnitureListener();
                    })();
                }
            }
        }
        else
            throw new Error('invalid overload');
        return _this;
    }
    HomeFurnitureGroup.IDENTITY_$LI$ = function () { if (HomeFurnitureGroup.IDENTITY == null)
        HomeFurnitureGroup.IDENTITY = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; return HomeFurnitureGroup.IDENTITY; };
    ;
    /**
     * Updates the location and size of this group from the furniture it contains.
     * @param {Array} furniture
     * @param {number} angle
     * @param {boolean} init
     * @private
     */
    HomeFurnitureGroup.prototype.updateLocationAndSize = function (furniture, angle, init) {
        this.resizable = true;
        this.deformable = true;
        this.texturable = true;
        this.doorOrWindow = true;
        this.currency = furniture[0].getCurrency();
        for (var index205 = 0; index205 < furniture.length; index205++) {
            var piece = furniture[index205];
            {
                this.resizable = this.resizable && piece.isResizable();
                this.deformable = this.deformable && piece.isDeformable();
                this.texturable = this.texturable && piece.isTexturable();
                this.doorOrWindow = this.doorOrWindow && piece.isDoorOrWindow();
                if (this.currency != null) {
                    if (piece.getCurrency() == null || !(piece.getCurrency() === this.currency)) {
                        this.currency = null;
                    }
                }
            }
        }
        var elevation = Number.MAX_VALUE;
        if (init) {
            var minLevel = null;
            for (var index206 = 0; index206 < furniture.length; index206++) {
                var piece = furniture[index206];
                {
                    var level = piece.getLevel();
                    if (level != null && (minLevel == null || level.getElevation() < minLevel.getElevation())) {
                        minLevel = level;
                    }
                }
            }
            for (var index207 = 0; index207 < furniture.length; index207++) {
                var piece = furniture[index207];
                {
                    if (piece.getLevel() != null) {
                        elevation = Math.min(elevation, piece.getGroundElevation() - minLevel.getElevation());
                        piece.setElevation(piece.getGroundElevation() - minLevel.getElevation());
                        piece.setLevel(null);
                    }
                    else {
                        elevation = Math.min(elevation, piece.getElevation());
                    }
                }
            }
        }
        else {
            for (var index208 = 0; index208 < furniture.length; index208++) {
                var piece = furniture[index208];
                {
                    elevation = Math.min(elevation, piece.getElevation());
                }
            }
        }
        var height = 0;
        var dropOnTopElevation = -1;
        for (var index209 = 0; index209 < furniture.length; index209++) {
            var piece = furniture[index209];
            {
                height = Math.max(height, piece.getElevation() + piece.getHeight());
                if (piece.getDropOnTopElevation() >= 0) {
                    dropOnTopElevation = Math.max(dropOnTopElevation, piece.getElevation() + piece.getHeight() * piece.getDropOnTopElevation());
                }
            }
        }
        height -= elevation;
        dropOnTopElevation -= elevation;
        var rotation = java.awt.geom.AffineTransform.getRotateInstance(-angle);
        var unrotatedBoundingRectangle = null;
        {
            var array211 = this.getFurnitureWithoutGroups(furniture);
            for (var index210 = 0; index210 < array211.length; index210++) {
                var piece = array211[index210];
                {
                    var pieceShape = new java.awt.geom.GeneralPath();
                    var points = piece.getPoints();
                    pieceShape.moveTo(points[0][0], points[0][1]);
                    for (var i = 1; i < points.length; i++) {
                        pieceShape.lineTo(points[i][0], points[i][1]);
                    }
                    pieceShape.closePath();
                    if (unrotatedBoundingRectangle == null) {
                        unrotatedBoundingRectangle = pieceShape.createTransformedShape(rotation).getBounds2D();
                    }
                    else {
                        unrotatedBoundingRectangle.add(pieceShape.createTransformedShape(rotation).getBounds2D());
                    }
                }
            }
        }
        var center = new java.awt.geom.Point2D.Float((Math.fround ? (unrotatedBoundingRectangle.getCenterX()) : Math.fround(unrotatedBoundingRectangle.getCenterX())), (Math.fround ? (unrotatedBoundingRectangle.getCenterY()) : Math.fround(unrotatedBoundingRectangle.getCenterY())));
        rotation.setToRotation(angle);
        rotation.transform(center, center);
        if (this.resizable) {
            _super.prototype.setWidth.call(this, (Math.fround ? (unrotatedBoundingRectangle.getWidth()) : Math.fround(unrotatedBoundingRectangle.getWidth())));
            _super.prototype.setDepth.call(this, (Math.fround ? (unrotatedBoundingRectangle.getHeight()) : Math.fround(unrotatedBoundingRectangle.getHeight())));
            _super.prototype.setHeight.call(this, height);
        }
        else {
            this.fixedWidth = (Math.fround ? (unrotatedBoundingRectangle.getWidth()) : Math.fround(unrotatedBoundingRectangle.getWidth()));
            this.fixedDepth = (Math.fround ? (unrotatedBoundingRectangle.getHeight()) : Math.fround(unrotatedBoundingRectangle.getHeight()));
            this.fixedHeight = height;
        }
        this.dropOnTopElevation = dropOnTopElevation / height;
        _super.prototype.setX.call(this, (Math.fround ? (center.getX()) : Math.fround(center.getX())));
        _super.prototype.setY.call(this, (Math.fround ? (center.getY()) : Math.fround(center.getY())));
        _super.prototype.setElevation.call(this, elevation);
    };
    /**
     * Adds a listener to the furniture of this group that will update the size and location
     * of the group when its furniture is moved or resized.
     * @private
     */
    HomeFurnitureGroup.prototype.addFurnitureListener = function () {
        this.furnitureListener = new HomeFurnitureGroup.LocationAndSizeChangeListener(this);
        for (var index212 = 0; index212 < this.furniture.length; index212++) {
            var piece = this.furniture[index212];
            {
                piece.addPropertyChangeListener(this.furnitureListener);
            }
        }
    };
    /**
     * Returns all the pieces of the given <code>furniture</code> list.
     * @param {Array} furniture
     * @return {Array}
     * @private
     */
    HomeFurnitureGroup.prototype.getFurnitureWithoutGroups = function (furniture) {
        var pieces = ([]);
        for (var index213 = 0; index213 < furniture.length; index213++) {
            var piece = furniture[index213];
            {
                if (piece != null && piece instanceof HomeFurnitureGroup) {
                    /* addAll */ (function (l1, l2) { return l1.push.apply(l1, l2); })(pieces, this.getFurnitureWithoutGroups(piece.getFurniture()));
                }
                else {
                    /* add */ pieces.push(piece);
                }
            }
        }
        return pieces;
    };
    /**
     * Returns the furniture of this group and of all its subgroups.
     * @since 5.0
     * @return {Array}
     */
    HomeFurnitureGroup.prototype.getAllFurniture = function () {
        var pieces = (this.furniture.slice(0));
        {
            var array215 = this.getFurniture();
            for (var index214 = 0; index214 < array215.length; index214++) {
                var piece = array215[index214];
                {
                    if (piece != null && piece instanceof HomeFurnitureGroup) {
                        /* addAll */ (function (l1, l2) { return l1.push.apply(l1, l2); })(pieces, piece.getAllFurniture());
                    }
                }
            }
        }
        return pieces;
    };
    /**
     * Returns an unmodifiable list of the furniture of this group.
     * @return {Array}
     */
    HomeFurnitureGroup.prototype.getFurniture = function () {
        return this.furniture.slice(0);
    };
    /**
     * Adds the <code>piece</code> in parameter at the given <code>index</code>.
     * @param {HomePieceOfFurniture} piece
     * @param {number} index
     */
    HomeFurnitureGroup.prototype.addPieceOfFurniture = function (piece, index) {
        this.furniture = (this.furniture.slice(0));
        piece.setLevel(this.getLevel());
        /* add */ this.furniture.splice(index, 0, piece);
        piece.addPropertyChangeListener(this.furnitureListener);
        this.updateLocationAndSize(this.furniture, this.getAngle(), false);
    };
    /**
     * Deletes the <code>piece</code> in parameter from this group.
     * @throws IllegalStateException if the last piece in this group is the one in parameter
     * @param {HomePieceOfFurniture} piece
     */
    HomeFurnitureGroup.prototype.deletePieceOfFurniture = function (piece) {
        var index = this.furniture.indexOf(piece);
        if (index !== -1) {
            if (this.furniture.length > 1) {
                piece.setLevel(null);
                piece.removePropertyChangeListener(this.furnitureListener);
                this.furniture = (this.furniture.slice(0));
                /* remove */ this.furniture.splice(index, 1);
                this.updateLocationAndSize(this.furniture, this.getAngle(), false);
            }
            else {
                throw new IllegalStateException("Group can\'t be empty");
            }
        }
    };
    /**
     * Returns <code>null</code>.
     * @return {string}
     */
    HomeFurnitureGroup.prototype.getCatalogId = function () {
        return null;
    };
    /**
     * Returns <code>null</code>.
     * @since 4.2
     * @return {string}
     */
    HomeFurnitureGroup.prototype.getInformation = function () {
        return null;
    };
    /**
     * Returns <code>true</code> if this group is movable.
     * @return {boolean}
     */
    HomeFurnitureGroup.prototype.isMovable = function () {
        return _super.prototype.isMovable.call(this);
    };
    /**
     * Sets whether this group is movable or not.
     * @since 3.1
     * @param {boolean} movable
     */
    HomeFurnitureGroup.prototype.setMovable = function (movable) {
        _super.prototype.setMovable.call(this, movable);
    };
    /**
     * Returns <code>true</code> if all furniture of this group are doors or windows.
     * @return {boolean}
     */
    HomeFurnitureGroup.prototype.isDoorOrWindow = function () {
        return this.doorOrWindow;
    };
    /**
     * Returns <code>true</code> if all furniture of this group are resizable.
     * @return {boolean}
     */
    HomeFurnitureGroup.prototype.isResizable = function () {
        return this.resizable;
    };
    /**
     * Returns <code>true</code> if all furniture of this group are deformable.
     * @since 3.0
     * @return {boolean}
     */
    HomeFurnitureGroup.prototype.isDeformable = function () {
        return this.deformable;
    };
    /**
     * Returns <code>true</code> if all furniture of this group are texturable.
     * @since 3.5
     * @return {boolean}
     */
    HomeFurnitureGroup.prototype.isTexturable = function () {
        return this.texturable;
    };
    /**
     * Returns the width of this group.
     * @return {number}
     */
    HomeFurnitureGroup.prototype.getWidth = function () {
        if (!this.resizable) {
            return this.fixedWidth;
        }
        else {
            return _super.prototype.getWidth.call(this);
        }
    };
    /**
     * Returns the depth of this group.
     * @return {number}
     */
    HomeFurnitureGroup.prototype.getDepth = function () {
        if (!this.resizable) {
            return this.fixedDepth;
        }
        else {
            return _super.prototype.getDepth.call(this);
        }
    };
    /**
     * Returns the height of this group.
     * @return {number}
     */
    HomeFurnitureGroup.prototype.getHeight = function () {
        if (!this.resizable) {
            return this.fixedHeight;
        }
        else {
            return _super.prototype.getHeight.call(this);
        }
    };
    /**
     * Returns the elevation at which should be placed an object dropped on this group.
     * @since 4.4
     * @return {number}
     */
    HomeFurnitureGroup.prototype.getDropOnTopElevation = function () {
        return this.dropOnTopElevation;
    };
    /**
     * Returns <code>null</code>.
     * @return {Content}
     */
    HomeFurnitureGroup.prototype.getIcon = function () {
        return null;
    };
    /**
     * Returns <code>null</code>.
     * @return {Content}
     */
    HomeFurnitureGroup.prototype.getPlanIcon = function () {
        return null;
    };
    /**
     * Returns <code>null</code>.
     * @return {Content}
     */
    HomeFurnitureGroup.prototype.getModel = function () {
        return null;
    };
    /**
     * Returns an identity matrix.
     * @return {Array}
     */
    HomeFurnitureGroup.prototype.getModelRotation = function () {
        return HomeFurnitureGroup.IDENTITY_$LI$();
    };
    /**
     * Returns <code>null</code>.
     * @since 3.5
     * @return {string}
     */
    HomeFurnitureGroup.prototype.getStaircaseCutOutShape = function () {
        return null;
    };
    /**
     * Returns <code>null</code>.
     * @since 4.2
     * @return {string}
     */
    HomeFurnitureGroup.prototype.getCreator = function () {
        return null;
    };
    /**
     * Returns the price of the furniture of this group with a price.
     * @return {Big}
     */
    HomeFurnitureGroup.prototype.getPrice = function () {
        var price = null;
        for (var index216 = 0; index216 < this.furniture.length; index216++) {
            var piece = this.furniture[index216];
            {
                if (piece.getPrice() != null) {
                    if (price == null) {
                        price = piece.getPrice();
                    }
                    else {
                        price = price.plus(piece.getPrice());
                    }
                }
            }
        }
        if (price == null) {
            return _super.prototype.getPrice.call(this);
        }
        else {
            return price;
        }
    };
    /**
     * Sets the price of this group.
     * @throws UnsupportedOperationException if the price of one of the pieces is set
     * @since 4.0
     * @param {Big} price
     */
    HomeFurnitureGroup.prototype.setPrice = function (price) {
        for (var index217 = 0; index217 < this.furniture.length; index217++) {
            var piece = this.furniture[index217];
            {
                if (piece.getPrice() != null) {
                    throw new UnsupportedOperationException("Can\'t change the price of a group containing pieces with a price");
                }
            }
        }
        _super.prototype.setPrice.call(this, price);
    };
    /**
     * Returns the VAT percentage of the furniture of this group
     * or <code>null</code> if one piece has no VAT percentage
     * or has a VAT percentage different from the other furniture.
     * @return {Big}
     */
    HomeFurnitureGroup.prototype.getValueAddedTaxPercentage = function () {
        var valueAddedTaxPercentage = this.furniture[0].getValueAddedTaxPercentage();
        if (valueAddedTaxPercentage != null) {
            for (var index218 = 0; index218 < this.furniture.length; index218++) {
                var piece = this.furniture[index218];
                {
                    var pieceValueAddedTaxPercentage = piece.getValueAddedTaxPercentage();
                    if (pieceValueAddedTaxPercentage == null || !(function (o, o2) { return o.equals ? o.equals(o2) : o === o2; })(pieceValueAddedTaxPercentage, valueAddedTaxPercentage)) {
                        return null;
                    }
                }
            }
        }
        return valueAddedTaxPercentage;
    };
    /**
     * Returns the currency of the furniture of this group
     * or <code>null</code> if one piece has no currency
     * or has a currency different from the other furniture.
     * @since 3.5
     * @return {string}
     */
    HomeFurnitureGroup.prototype.getCurrency = function () {
        return this.currency;
    };
    /**
     * Returns the VAT of the furniture of this group.
     * @return {Big}
     */
    HomeFurnitureGroup.prototype.getValueAddedTax = function () {
        var valueAddedTax = null;
        for (var index219 = 0; index219 < this.furniture.length; index219++) {
            var piece = this.furniture[index219];
            {
                var pieceValueAddedTax = piece.getValueAddedTax();
                if (pieceValueAddedTax != null) {
                    if (valueAddedTax == null) {
                        valueAddedTax = pieceValueAddedTax;
                    }
                    else {
                        valueAddedTax = valueAddedTax.plus(pieceValueAddedTax);
                    }
                }
            }
        }
        return valueAddedTax;
    };
    /**
     * Returns the total price of the furniture of this group.
     * @return {Big}
     */
    HomeFurnitureGroup.prototype.getPriceValueAddedTaxIncluded = function () {
        var priceValueAddedTaxIncluded = null;
        for (var index220 = 0; index220 < this.furniture.length; index220++) {
            var piece = this.furniture[index220];
            {
                if (piece.getPrice() != null) {
                    if (priceValueAddedTaxIncluded == null) {
                        priceValueAddedTaxIncluded = piece.getPriceValueAddedTaxIncluded();
                    }
                    else {
                        priceValueAddedTaxIncluded = priceValueAddedTaxIncluded.plus(piece.getPriceValueAddedTaxIncluded());
                    }
                }
            }
        }
        return priceValueAddedTaxIncluded;
    };
    /**
     * Returns <code>false</code>.
     * @return {boolean}
     */
    HomeFurnitureGroup.prototype.isBackFaceShown = function () {
        return false;
    };
    /**
     * Returns <code>null</code>.
     * @since 5.2
     * @return {number}
     */
    HomeFurnitureGroup.prototype.getColor = function () {
        return null;
    };
    /**
     * Sets the <code>color</code> of the furniture of this group.
     * @param {number} color
     */
    HomeFurnitureGroup.prototype.setColor = function (color) {
        if (this.isTexturable()) {
            for (var index221 = 0; index221 < this.furniture.length; index221++) {
                var piece = this.furniture[index221];
                {
                    piece.setColor(color);
                }
            }
        }
    };
    /**
     * Returns <code>null</code>.
     * @since 5.2
     * @return {HomeTexture}
     */
    HomeFurnitureGroup.prototype.getTexture = function () {
        return null;
    };
    /**
     * Sets the <code>texture</code> of the furniture of this group.
     * @param {HomeTexture} texture
     */
    HomeFurnitureGroup.prototype.setTexture = function (texture) {
        if (this.isTexturable()) {
            for (var index222 = 0; index222 < this.furniture.length; index222++) {
                var piece = this.furniture[index222];
                {
                    piece.setTexture(texture);
                }
            }
        }
    };
    /**
     * Returns <code>null</code>.
     * @since 5.2
     * @return {Array}
     */
    HomeFurnitureGroup.prototype.getModelMaterials = function () {
        return null;
    };
    /**
     * Sets the materials of the furniture of this group.
     * @param {Array} modelMaterials
     */
    HomeFurnitureGroup.prototype.setModelMaterials = function (modelMaterials) {
        if (this.isTexturable()) {
            for (var index223 = 0; index223 < this.furniture.length; index223++) {
                var piece = this.furniture[index223];
                {
                    piece.setModelMaterials(modelMaterials);
                }
            }
        }
    };
    /**
     * Returns <code>null</code>.
     * @since 5.2
     * @return {number}
     */
    HomeFurnitureGroup.prototype.getShininess = function () {
        return null;
    };
    /**
     * Sets the shininess of the furniture of this group.
     * @since 5.2
     * @param {number} shininess
     */
    HomeFurnitureGroup.prototype.setShininess = function (shininess) {
        if (this.isTexturable()) {
            for (var index224 = 0; index224 < this.furniture.length; index224++) {
                var piece = this.furniture[index224];
                {
                    piece.setShininess(shininess);
                }
            }
        }
    };
    /**
     * Sets the <code>angle</code> of the furniture of this group.
     * @param {number} angle
     */
    HomeFurnitureGroup.prototype.setAngle = function (angle) {
        if (angle !== this.getAngle()) {
            var angleDelta = angle - this.getAngle();
            var cosAngleDelta = Math.cos(angleDelta);
            var sinAngleDelta = Math.sin(angleDelta);
            for (var index225 = 0; index225 < this.furniture.length; index225++) {
                var piece = this.furniture[index225];
                {
                    piece.removePropertyChangeListener(this.furnitureListener);
                    piece.setAngle(piece.getAngle() + angleDelta);
                    var newX = this.getX() + (Math.fround ? (((piece.getX() - this.getX()) * cosAngleDelta - (piece.getY() - this.getY()) * sinAngleDelta)) : Math.fround(((piece.getX() - this.getX()) * cosAngleDelta - (piece.getY() - this.getY()) * sinAngleDelta)));
                    var newY = this.getY() + (Math.fround ? (((piece.getX() - this.getX()) * sinAngleDelta + (piece.getY() - this.getY()) * cosAngleDelta)) : Math.fround(((piece.getX() - this.getX()) * sinAngleDelta + (piece.getY() - this.getY()) * cosAngleDelta)));
                    piece.setX(newX);
                    piece.setY(newY);
                    piece.addPropertyChangeListener(this.furnitureListener);
                }
            }
            _super.prototype.setAngle.call(this, angle);
        }
    };
    /**
     * Sets the <code>abscissa</code> of this group and moves its furniture accordingly.
     * @param {number} x
     */
    HomeFurnitureGroup.prototype.setX = function (x) {
        if (x !== this.getX()) {
            var dx = x - this.getX();
            for (var index226 = 0; index226 < this.furniture.length; index226++) {
                var piece = this.furniture[index226];
                {
                    piece.removePropertyChangeListener(this.furnitureListener);
                    piece.setX(piece.getX() + dx);
                    piece.addPropertyChangeListener(this.furnitureListener);
                }
            }
            _super.prototype.setX.call(this, x);
        }
    };
    /**
     * Sets the <code>ordinate</code> of this group and moves its furniture accordingly.
     * @param {number} y
     */
    HomeFurnitureGroup.prototype.setY = function (y) {
        if (y !== this.getY()) {
            var dy = y - this.getY();
            for (var index227 = 0; index227 < this.furniture.length; index227++) {
                var piece = this.furniture[index227];
                {
                    piece.addPropertyChangeListener(this.furnitureListener);
                    piece.setY(piece.getY() + dy);
                    piece.removePropertyChangeListener(this.furnitureListener);
                }
            }
            _super.prototype.setY.call(this, y);
        }
    };
    /**
     * Sets the <code>width</code> of this group, then moves and resizes its furniture accordingly.
     * @param {number} width
     */
    HomeFurnitureGroup.prototype.setWidth = function (width) {
        if (width !== this.getWidth()) {
            var widthFactor = width / this.getWidth();
            var angle = this.getAngle();
            for (var index228 = 0; index228 < this.furniture.length; index228++) {
                var piece = this.furniture[index228];
                {
                    piece.removePropertyChangeListener(this.furnitureListener);
                    var angleDelta = piece.getAngle() - angle;
                    var pieceWidth = piece.getWidth();
                    var pieceDepth = piece.getDepth();
                    piece.setWidth(pieceWidth + pieceWidth * (widthFactor - 1) * Math.abs((Math.fround ? (Math.cos(angleDelta)) : Math.fround(Math.cos(angleDelta)))));
                    piece.setDepth(pieceDepth + pieceDepth * (widthFactor - 1) * Math.abs((Math.fround ? (Math.sin(angleDelta)) : Math.fround(Math.sin(angleDelta)))));
                    var cosAngle = Math.cos(angle);
                    var sinAngle = Math.sin(angle);
                    var newX = this.getX() + (Math.fround ? (((piece.getX() - this.getX()) * cosAngle + (piece.getY() - this.getY()) * sinAngle)) : Math.fround(((piece.getX() - this.getX()) * cosAngle + (piece.getY() - this.getY()) * sinAngle)));
                    var newY = this.getY() + (Math.fround ? (((piece.getX() - this.getX()) * -sinAngle + (piece.getY() - this.getY()) * cosAngle)) : Math.fround(((piece.getX() - this.getX()) * -sinAngle + (piece.getY() - this.getY()) * cosAngle)));
                    newX = this.getX() + (newX - this.getX()) * widthFactor;
                    piece.setX(this.getX() + (Math.fround ? (((newX - this.getX()) * cosAngle - (newY - this.getY()) * sinAngle)) : Math.fround(((newX - this.getX()) * cosAngle - (newY - this.getY()) * sinAngle))));
                    piece.setY(this.getY() + (Math.fround ? (((newX - this.getX()) * sinAngle + (newY - this.getY()) * cosAngle)) : Math.fround(((newX - this.getX()) * sinAngle + (newY - this.getY()) * cosAngle))));
                    piece.addPropertyChangeListener(this.furnitureListener);
                }
            }
            _super.prototype.setWidth.call(this, width);
        }
    };
    /**
     * Sets the <code>depth</code> of this group, then moves and resizes its furniture accordingly.
     * @param {number} depth
     */
    HomeFurnitureGroup.prototype.setDepth = function (depth) {
        if (depth !== this.getDepth()) {
            var depthFactor = depth / this.getDepth();
            var angle = this.getAngle();
            for (var index229 = 0; index229 < this.furniture.length; index229++) {
                var piece = this.furniture[index229];
                {
                    piece.removePropertyChangeListener(this.furnitureListener);
                    var angleDelta = piece.getAngle() - angle;
                    var pieceWidth = piece.getWidth();
                    var pieceDepth = piece.getDepth();
                    piece.setWidth(pieceWidth + pieceWidth * (depthFactor - 1) * Math.abs((Math.fround ? (Math.sin(angleDelta)) : Math.fround(Math.sin(angleDelta)))));
                    piece.setDepth(pieceDepth + pieceDepth * (depthFactor - 1) * Math.abs((Math.fround ? (Math.cos(angleDelta)) : Math.fround(Math.cos(angleDelta)))));
                    var cosAngle = Math.cos(angle);
                    var sinAngle = Math.sin(angle);
                    var newX = this.getX() + (Math.fround ? (((piece.getX() - this.getX()) * cosAngle + (piece.getY() - this.getY()) * sinAngle)) : Math.fround(((piece.getX() - this.getX()) * cosAngle + (piece.getY() - this.getY()) * sinAngle)));
                    var newY = this.getY() + (Math.fround ? (((piece.getX() - this.getX()) * -sinAngle + (piece.getY() - this.getY()) * cosAngle)) : Math.fround(((piece.getX() - this.getX()) * -sinAngle + (piece.getY() - this.getY()) * cosAngle)));
                    newY = this.getY() + (newY - this.getY()) * depthFactor;
                    piece.setX(this.getX() + (Math.fround ? (((newX - this.getX()) * cosAngle - (newY - this.getY()) * sinAngle)) : Math.fround(((newX - this.getX()) * cosAngle - (newY - this.getY()) * sinAngle))));
                    piece.setY(this.getY() + (Math.fround ? (((newX - this.getX()) * sinAngle + (newY - this.getY()) * cosAngle)) : Math.fround(((newX - this.getX()) * sinAngle + (newY - this.getY()) * cosAngle))));
                    piece.addPropertyChangeListener(this.furnitureListener);
                }
            }
            _super.prototype.setDepth.call(this, depth);
        }
    };
    /**
     * Sets the <code>height</code> of this group, then moves and resizes its furniture accordingly.
     * @param {number} height
     */
    HomeFurnitureGroup.prototype.setHeight = function (height) {
        if (height !== this.getHeight()) {
            var heightFactor = height / this.getHeight();
            for (var index230 = 0; index230 < this.furniture.length; index230++) {
                var piece = this.furniture[index230];
                {
                    piece.removePropertyChangeListener(this.furnitureListener);
                    piece.setHeight(piece.getHeight() * heightFactor);
                    piece.setElevation(this.getElevation() + (piece.getElevation() - this.getElevation()) * heightFactor);
                    piece.addPropertyChangeListener(this.furnitureListener);
                }
            }
            _super.prototype.setHeight.call(this, height);
        }
    };
    /**
     * Sets the <code>elevation</code> of this group, then moves its furniture accordingly.
     * @param {number} elevation
     */
    HomeFurnitureGroup.prototype.setElevation = function (elevation) {
        if (elevation !== this.getElevation()) {
            var elevationDelta = elevation - this.getElevation();
            for (var index231 = 0; index231 < this.furniture.length; index231++) {
                var piece = this.furniture[index231];
                {
                    piece.removePropertyChangeListener(this.furnitureListener);
                    piece.setElevation(piece.getElevation() + elevationDelta);
                    piece.addPropertyChangeListener(this.furnitureListener);
                }
            }
            _super.prototype.setElevation.call(this, elevation);
        }
    };
    /**
     * Sets whether the furniture of this group should be mirrored or not.
     * @param {boolean} modelMirrored
     */
    HomeFurnitureGroup.prototype.setModelMirrored = function (modelMirrored) {
        if (modelMirrored !== this.isModelMirrored()) {
            var angle = this.getAngle();
            for (var index232 = 0; index232 < this.furniture.length; index232++) {
                var piece = this.furniture[index232];
                {
                    piece.removePropertyChangeListener(this.furnitureListener);
                    piece.setModelMirrored(!piece.isModelMirrored());
                    var cosAngle = Math.cos(angle);
                    var sinAngle = Math.sin(angle);
                    var newX = this.getX() + (Math.fround ? (((piece.getX() - this.getX()) * cosAngle + (piece.getY() - this.getY()) * sinAngle)) : Math.fround(((piece.getX() - this.getX()) * cosAngle + (piece.getY() - this.getY()) * sinAngle)));
                    var newY = this.getY() + (Math.fround ? (((piece.getX() - this.getX()) * -sinAngle + (piece.getY() - this.getY()) * cosAngle)) : Math.fround(((piece.getX() - this.getX()) * -sinAngle + (piece.getY() - this.getY()) * cosAngle)));
                    newX = this.getX() - (newX - this.getX());
                    piece.setX(this.getX() + (Math.fround ? (((newX - this.getX()) * cosAngle - (newY - this.getY()) * sinAngle)) : Math.fround(((newX - this.getX()) * cosAngle - (newY - this.getY()) * sinAngle))));
                    piece.setY(this.getY() + (Math.fround ? (((newX - this.getX()) * sinAngle + (newY - this.getY()) * cosAngle)) : Math.fround(((newX - this.getX()) * sinAngle + (newY - this.getY()) * cosAngle))));
                    piece.addPropertyChangeListener(this.furnitureListener);
                }
            }
            _super.prototype.setModelMirrored.call(this, modelMirrored);
        }
    };
    /**
     * Sets whether the furniture of this group should be visible or not.
     * @param {boolean} visible
     */
    HomeFurnitureGroup.prototype.setVisible = function (visible) {
        for (var index233 = 0; index233 < this.furniture.length; index233++) {
            var piece = this.furniture[index233];
            {
                piece.setVisible(visible);
            }
        }
        _super.prototype.setVisible.call(this, visible);
    };
    /**
     * Set the level of this group and the furniture it contains.
     * @param {Level} level
     */
    HomeFurnitureGroup.prototype.setLevel = function (level) {
        for (var index234 = 0; index234 < this.furniture.length; index234++) {
            var piece = this.furniture[index234];
            {
                piece.setLevel(level);
            }
        }
        _super.prototype.setLevel.call(this, level);
    };
    /**
     * Returns <code>true</code> if one of the pieces of this group intersects
     * with the horizontal rectangle which opposite corners are at points
     * (<code>x0</code>, <code>y0</code>) and (<code>x1</code>, <code>y1</code>).
     * @since 3.5
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @return {boolean}
     */
    HomeFurnitureGroup.prototype.intersectsRectangle = function (x0, y0, x1, y1) {
        for (var index235 = 0; index235 < this.furniture.length; index235++) {
            var piece = this.furniture[index235];
            {
                if (piece.intersectsRectangle(x0, y0, x1, y1)) {
                    return true;
                }
            }
        }
        return false;
    };
    HomeFurnitureGroup.prototype.containsPoint = function (x, y, includeBaseboards, margin) {
        if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof includeBaseboards === 'number') || includeBaseboards === null) && margin === undefined) {
            return this.containsPoint$float$float$float(x, y, includeBaseboards);
        }
        else
            throw new Error('invalid overload');
    };
    /**
     * Returns <code>true</code> if one of the pieces of this group contains
     * the point at (<code>x</code>, <code>y</code>)
     * with a given <code>margin</code>.
     * @since 3.5
     * @param {number} x
     * @param {number} y
     * @param {number} margin
     * @return {boolean}
     */
    HomeFurnitureGroup.prototype.containsPoint$float$float$float = function (x, y, margin) {
        for (var index236 = 0; index236 < this.furniture.length; index236++) {
            var piece = this.furniture[index236];
            {
                if (piece.containsPoint$float$float$float(x, y, margin)) {
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Returns a clone of this group with cloned furniture.
     * @return {HomeFurnitureGroup}
     */
    HomeFurnitureGroup.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_13 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_13[p] = o[p];
            }
            return clone_13;
        } })(this);
        clone.furniture = ([]);
        for (var index237 = 0; index237 < this.furniture.length; index237++) {
            var piece = this.furniture[index237];
            {
                var pieceClone = (function (o) { if (o.clone != undefined) {
                    return o.clone();
                }
                else {
                    var clone_14 = Object.create(o);
                    for (var p in o) {
                        if (o.hasOwnProperty(p))
                            clone_14[p] = o[p];
                    }
                    return clone_14;
                } })(piece);
                /* add */ clone.furniture.push(pieceClone);
                if ((piece != null && piece instanceof HomeDoorOrWindow) && piece.isBoundToWall()) {
                    pieceClone.setBoundToWall(true);
                }
            }
        }
        clone.furniture = clone.furniture.slice(0);
        clone.addFurnitureListener();
        return clone;
    };
    return HomeFurnitureGroup;
}(HomePieceOfFurniture));
HomeFurnitureGroup["__class"] = "HomeFurnitureGroup";
HomeFurnitureGroup["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "com.eteks.sweethome3d.model.PieceOfFurniture", "com.eteks.sweethome3d.model.Elevatable", "java.io.Serializable"];
(function (HomeFurnitureGroup) {
    /**
     * Properties listener that updates the size and location of this group.
     * This listener is bound to this group with a weak reference to avoid a strong link
     * of this group towards the furniture it contains.
     */
    var LocationAndSizeChangeListener = (function () {
        function LocationAndSizeChangeListener(group) {
            this.group = null;
            this.group = (group);
        }
        LocationAndSizeChangeListener.prototype.propertyChange = function (ev) {
            var group = this.group;
            if (group == null) {
                ev.getSource().removePropertyChangeListener(this);
            }
            else if (("X" === ev.getPropertyName()) || ("Y" === ev.getPropertyName()) || ("ELEVATION" === ev.getPropertyName()) || ("ANGLE" === ev.getPropertyName()) || ("WIDTH" === ev.getPropertyName()) || ("DEPTH" === ev.getPropertyName()) || ("HEIGHT" === ev.getPropertyName())) {
                group.updateLocationAndSize(group.getFurniture(), group.getAngle(), false);
            }
        };
        return LocationAndSizeChangeListener;
    }());
    HomeFurnitureGroup.LocationAndSizeChangeListener = LocationAndSizeChangeListener;
    LocationAndSizeChangeListener["__class"] = "HomeFurnitureGroup.LocationAndSizeChangeListener";
    LocationAndSizeChangeListener["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
})(HomeFurnitureGroup || (HomeFurnitureGroup = {}));
/**
 * Creates a home light from an existing one.
 * @param {Light} light the light from which data are copied
 * @class
 */
var HomeLight = (function (_super) {
    __extends(HomeLight, _super);
    function HomeLight(light) {
        var _this = _super.call(this, light) || this;
        /*private*/ _this.propertyChangeSupport = new PropertyChangeSupport(_this);
        _this.lightSources = null;
        _this.power = 0;
        _this.lightSources = light.getLightSources();
        _this.power = 0.5;
        return _this;
    }
    /**
     * Adds the property change <code>listener</code> in parameter to this piece.
     * @since 3.0
     * @param {PropertyChangeListener} listener
     */
    HomeLight.prototype.addPropertyChangeListener = function (listener) {
        this.propertyChangeSupport.addPropertyChangeListener(listener);
        _super.prototype.addPropertyChangeListener.call(this, listener);
    };
    /**
     * Removes the property change <code>listener</code> in parameter from this piece.
     * @since 3.0
     * @param {PropertyChangeListener} listener
     */
    HomeLight.prototype.removePropertyChangeListener = function (listener) {
        this.propertyChangeSupport.removePropertyChangeListener(listener);
        _super.prototype.removePropertyChangeListener.call(this, listener);
    };
    /**
     * Returns the sources managed by this light. Each light source point
     * is a percentage of the width, the depth and the height of this light.
     * with the abscissa origin at the left side of the piece,
     * the ordinate origin at the front side of the piece
     * and the elevation origin at the bottom side of the piece.
     * @return {Array} a copy of light sources array.
     */
    HomeLight.prototype.getLightSources = function () {
        if (this.lightSources.length === 0) {
            return this.lightSources;
        }
        else {
            return this.lightSources.slice(0);
        }
    };
    /**
     * Returns the power of this light.
     * @since 3.0
     * @return {number}
     */
    HomeLight.prototype.getPower = function () {
        return this.power;
    };
    /**
     * Sets the power of this light. Once this light is updated,
     * listeners added to this piece will receive a change notification.
     * @since 3.0
     * @param {number} power
     */
    HomeLight.prototype.setPower = function (power) {
        if (power !== this.power) {
            var oldPower = this.power;
            this.power = power;
            this.propertyChangeSupport.firePropertyChange(/* name */ "POWER", oldPower, power);
        }
    };
    /**
     * Returns a clone of this light.
     * @return {HomeLight}
     */
    HomeLight.prototype.clone = function () {
        var _this = this;
        var clone = (function (o) { if (_super.prototype.clone != undefined) {
            return _super.prototype.clone.call(_this);
        }
        else {
            var clone_15 = Object.create(o);
            for (var p in o) {
                if (o.hasOwnProperty(p))
                    clone_15[p] = o[p];
            }
            return clone_15;
        } })(this);
        clone.propertyChangeSupport = new PropertyChangeSupport(clone);
        return clone;
    };
    return HomeLight;
}(HomePieceOfFurniture));
HomeLight["__class"] = "HomeLight";
HomeLight["__interfaces"] = ["java.lang.Cloneable", "com.eteks.sweethome3d.model.Selectable", "com.eteks.sweethome3d.model.PieceOfFurniture", "com.eteks.sweethome3d.model.Elevatable", "com.eteks.sweethome3d.model.Light", "java.io.Serializable"];
HomeFurnitureGroup.IDENTITY_$LI$();
Home.LEVEL_ELEVATION_COMPARATOR_$LI$();
HomePieceOfFurniture.IDENTITY_$LI$();
HomePieceOfFurniture.SORTABLE_PROPERTY_COMPARATORS_$LI$();
HomePieceOfFurniture.TWICE_PI_$LI$();
HomePieceOfFurniture.__static_initialize();
Room.TWICE_PI_$LI$();
Label.TWICE_PI_$LI$();
TexturesCategory.COMPARATOR_$LI$();
TextStyle.textStylesCache_$LI$();
FurnitureCategory.COMPARATOR_$LI$();
CatalogTexture.recentFilters_$LI$();
CatalogTexture.COMPARATOR_$LI$();
CatalogTexture.EMPTY_CRITERIA_$LI$();
CatalogTexture.__static_initialize();
CatalogPieceOfFurniture.recentFilters_$LI$();
CatalogPieceOfFurniture.COMPARATOR_$LI$();
CatalogPieceOfFurniture.EMPTY_CRITERIA_$LI$();
CatalogPieceOfFurniture.INDENTITY_ROTATION_$LI$();
CatalogPieceOfFurniture.__static_initialize();
Baseboard.baseboardsCache_$LI$();
