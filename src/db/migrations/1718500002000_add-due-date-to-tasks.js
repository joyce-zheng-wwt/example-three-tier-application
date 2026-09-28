exports.up = (pgm) => {
  pgm.addColumn('tasks', {
    due_date: { type: 'date', notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('tasks', 'due_date');
};
