import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RoleAttributes {
  id_role: number;
  role_name: string;
  description?: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id_role' | 'description'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id_role!: number;
  public role_name!: string;
  public description?: string;
}

Role.init(
  {
    id_role: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_role'
    },
    role_name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      field: 'role_name'
    },
    description: {
      type: DataTypes.STRING(255),
      field: 'description'
    }
  },
  {
    sequelize,
    tableName: 'roles',
    timestamps: false
  }
);

export default Role;