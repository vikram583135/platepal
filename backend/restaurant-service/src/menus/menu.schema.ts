    import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
    import { Document } from 'mongoose';
    
    // --- Sub-document for a single item on the menu (e.g., Paneer Tikka) ---
    // {_id: false} prevents Mongoose from creating a separate _id for this sub-document.
    @Schema({ _id: false })
    class MenuItem {
      @Prop({ required: true })
      name: string;

      @Prop()
      description: string;
    
      @Prop({ required: true })
      price: number;
    
      @Prop({ default: true }) // Items are in stock by default
      inStock: boolean;
    }
    const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
    
    // --- Sub-document for a menu category (e.g., Appetizers, Main Course) ---
    @Schema({ _id: false })
    class MenuCategory {
      @Prop({ required: true })
      name: string;
    
      // This defines 'items' as an array of MenuItem documents.
      @Prop([MenuItemSchema])
      items: MenuItem[];
    }
    const MenuCategorySchema = SchemaFactory.createForClass(MenuCategory);
    
    // --- This is the main, top-level Menu Document ---
    // It will be stored in a 'menus' collection in MongoDB.
    @Schema()
    export class Menu extends Document {
      // This creates the link back to the Restaurant profile in our PostgreSQL database.
      @Prop({ required: true, index: true }) // Indexed for faster lookups
      restaurantId: number;
    
      // This defines 'categories' as an array of MenuCategory documents.
      @Prop([MenuCategorySchema])
      categories: MenuCategory[];
    }
    
    export const MenuSchema = SchemaFactory.createForClass(Menu);
    
    

