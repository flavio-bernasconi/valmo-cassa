export interface SimpleCartQRData {
  items: {
    id: string;
    quantity: number;
  }[];
}

export interface QRDecodeResult {
  success: boolean;
  cart?: SimpleCartQRData;
  error?: string;
  warnings?: string[];
}

export class CartQRCodec {
  static encode(cart: { item: { id: string }; quantity: number }[]): string {
    return cart
      .map(item => `${item.item.id}_${item.quantity}`)
      .join('--');
  }

  static decode(qrData: string): QRDecodeResult {
    try {
      if (!qrData.trim()) {
        return {
          success: false,
          error: "QR code vuoto"
        };
      }

      const items = qrData
        .split('--')
        .filter(Boolean)
        .map(itemStr => {
          const [id, quantity] = itemStr.split('_');
          
          if (!id || !quantity) {
            throw new Error(`Formato non valido: ${itemStr}`);
          }
          
          const qty = parseInt(quantity, 10);
          if (isNaN(qty) || qty <= 0) {
            throw new Error(`Quantità non valida: ${quantity}`);
          }
          
          return { id, quantity: qty };
        });

      return {
        success: true,
        cart: { items }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Formato QR code non valido"
      };
    }
  }

  static validateCartAgainstMenu(cartData: SimpleCartQRData, menuItems: { id: string; name: string; price: number }[]): QRDecodeResult {
    const warnings: string[] = [];
    const validItems = cartData.items.map(qrItem => {
      const menuItem = menuItems.find(mi => mi.id === qrItem.id);
      
      if (!menuItem) {
        warnings.push(`Prodotto rimosso: ID ${qrItem.id}`);
        return null;
      }

      return {
        ...qrItem,
        name: menuItem.name,
        price: menuItem.price
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      success: true,
      cart: {
        items: validItems
      },
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }
}
