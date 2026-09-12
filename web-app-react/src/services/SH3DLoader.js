import JSZip from 'jszip';

export class SH3DLoader {
  /**
   * Parses a native Java Sweet Home 3D (.sh3d) file directly in the browser
   */
  static async loadSH3DFile(file) {
    try {
      const zip = await JSZip.loadAsync(file);
      
      // Look for Home.xml inside the zip archive
      let homeXmlFile = zip.file('Home.xml');
      if (!homeXmlFile) {
        // Look for any .xml file in root
        const files = Object.keys(zip.files);
        const xmlName = files.find(f => f.endsWith('.xml'));
        if (xmlName) {
          homeXmlFile = zip.file(xmlName);
        }
      }

      if (!homeXmlFile) {
        throw new Error('No Home.xml found in this .sh3d file');
      }

      const xmlText = await homeXmlFile.async('text');
      return this.parseHomeXml(xmlText);
    } catch (err) {
      console.error('Error parsing .sh3d archive:', err);
      throw err;
    }
  }

  /**
   * Parses the XML structure from Java Sweet Home 3D into WebGL HomeState
   */
  static parseHomeXml(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    const walls = [];
    const rooms = [];
    const furniture = [];

    // 1. Parse Walls
    const wallNodes = doc.querySelectorAll('wall, com.eteks.sweethome3d.model.Wall');
    wallNodes.forEach((wNode, i) => {
      const xStart = parseFloat(wNode.getAttribute('xStart') || wNode.getAttribute('x1') || 0);
      const yStart = parseFloat(wNode.getAttribute('yStart') || wNode.getAttribute('y1') || 0);
      const xEnd = parseFloat(wNode.getAttribute('xEnd') || wNode.getAttribute('x2') || 0);
      const yEnd = parseFloat(wNode.getAttribute('yEnd') || wNode.getAttribute('y2') || 0);
      const thickness = parseFloat(wNode.getAttribute('thickness') || 15);
      const height = parseFloat(wNode.getAttribute('height') || 250);

      if (Math.hypot(xEnd - xStart, yEnd - yStart) > 5) {
        walls.push({
          id: `w_${i}`,
          x1: xStart,
          y1: yStart,
          x2: xEnd,
          y2: yEnd,
          thickness: thickness || 15,
          height: height || 250
        });
      }
    });

    // 2. Parse Rooms
    const roomNodes = doc.querySelectorAll('room, com.eteks.sweethome3d.model.Room');
    roomNodes.forEach((rNode, i) => {
      const pointNodes = rNode.querySelectorAll('point');
      const points = [];
      pointNodes.forEach(p => {
        points.push({
          x: parseFloat(p.getAttribute('x') || 0),
          y: parseFloat(p.getAttribute('y') || 0)
        });
      });

      const name = rNode.getAttribute('name') || `Room ${i + 1}`;
      const color = rNode.getAttribute('color') || '#f1f5f9';

      if (points.length >= 3) {
        rooms.push({
          id: `r_${i}`,
          name,
          color,
          points
        });
      }
    });

    // 3. Parse Furniture Pieces
    const pieceNodes = doc.querySelectorAll('pieceOfFurniture, com.eteks.sweethome3d.model.HomePieceOfFurniture, com.eteks.sweethome3d.model.HomeDoorOrWindow');
    pieceNodes.forEach((pNode, i) => {
      const name = pNode.getAttribute('name') || 'Furniture Piece';
      const x = parseFloat(pNode.getAttribute('x') || 0);
      const y = parseFloat(pNode.getAttribute('y') || 0);
      const width = parseFloat(pNode.getAttribute('width') || 80);
      const depth = parseFloat(pNode.getAttribute('depth') || 80);
      const height = parseFloat(pNode.getAttribute('height') || 80);
      const elevation = parseFloat(pNode.getAttribute('elevation') || 0);
      const angle = parseFloat(pNode.getAttribute('angle') || 0) * (180 / Math.PI); // Convert radians to deg
      const color = pNode.getAttribute('color') || '#3b82f6';
      
      // Determine type tag from name or model
      let type = 'sofa';
      const nameLower = name.toLowerCase();
      if (nameLower.includes('bed')) type = 'bed140x190';
      else if (nameLower.includes('table')) type = 'roundTable';
      else if (nameLower.includes('chair')) type = 'chair';
      else if (nameLower.includes('cabinet') || nameLower.includes('kitchen')) type = 'kitchenCabinet';
      else if (nameLower.includes('bath')) type = 'bath';
      else if (nameLower.includes('door')) type = 'door';
      else if (nameLower.includes('window')) type = 'window85x123';
      else if (nameLower.includes('plant')) type = 'plant';
      else if (nameLower.includes('tv')) type = 'tvUnit';

      furniture.push({
        id: `f_${i}_${Date.now()}`,
        type,
        name,
        x,
        y,
        width: Math.abs(width) || 80,
        depth: Math.abs(depth) || 80,
        height: Math.abs(height) || 80,
        elevation: elevation || 0,
        angle: angle || 0,
        color
      });
    });

    // Fallback if empty or relative coordinates
    if (walls.length === 0 && furniture.length === 0) {
      throw new Error('No wall or furniture elements detected in this file format.');
    }

    return { walls, rooms, furniture };
  }
}
