exports.up = (pgm) => {
  pgm.createTable('alarms', {
    id: { type: 'serial', primaryKey: true },
    title: { type: 'varchar(500)', notNull: true },
    time: { type: 'time', notNull: true },
    enabled: { type: 'boolean', notNull: true, default: true },
    days: { type: 'varchar(50)', notNull: true, default: 'daily' }, // daily, weekdays, weekends, or specific days
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('alarms');
};
