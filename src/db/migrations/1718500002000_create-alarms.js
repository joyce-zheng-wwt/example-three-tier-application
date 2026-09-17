exports.up = (pgm) => {
  pgm.createTable('alarms', {
    id: { type: 'serial', primaryKey: true },
    label: { type: 'varchar(200)', notNull: true, default: 'Alarm' },
    time: { type: 'time', notNull: true },
    enabled: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('alarms');
};
