import { Model, FilterQuery, UpdateQuery } from 'mongoose';

abstract class BaseCrudModel<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async insert(data: Partial<T>): Promise<T> {
    const createdItem = await this.model.create(data);
    return createdItem;
  }

  async insertMany(data: Partial<T[]>): Promise<T[]> {
    const createdItem = await this.model.insertMany(data);
    return createdItem;
  }

  async findById(id: string): Promise<T | null> {
    const item = await this.model.findById<T>(id);
    return item;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    const items = await this.model.findOne<T>(filter).exec();
    return items;
  }

  async findMany(filter: FilterQuery<T>): Promise<T[]> {
    const items = await this.model.find<T>(filter).exec();
    return items;
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    const updatedItem = await this.model.findByIdAndUpdate(id, data);
    return updatedItem;
  }

  async updateOne(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null> {
    const updatedItem = await this.model.findOneAndUpdate(filter, data);
    return updatedItem;
  }

  async deleteById(id: string): Promise<T | null> {
    const deletedItem = await this.model.findByIdAndDelete(id);
    return deletedItem;
  }
  async deleteOne(filter: FilterQuery<T>) {
    const deletedItem = await this.model.deleteOne(filter);
    return deletedItem;
  }
  async upsert(filter: FilterQuery<T>, data: Partial<T>): Promise<T> {
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const upsertedItem = await this.model.findOneAndUpdate(filter, data, options);
    return upsertedItem;
  }
}

export default BaseCrudModel;
