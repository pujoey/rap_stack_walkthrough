class CreateFish < ActiveRecord::Migration
  def change
    create_table :fish do |t|
      t.string :name
      t.string :category

      t.timestamps null: false
    end
  end
end
