import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MoodEntry {
  mood: string;
  note?: string;
  recorded_at: string;
}

interface RitualEntry {
  ritual_type: string;
  duration_seconds?: number;
  completed_at: string;
}

interface ProfileStats {
  nickname: string;
  current_streak: number;
  longest_streak: number;
  total_rituals_completed: number;
  total_patterns_released: number;
  total_moods_logged: number;
  total_insights_saved: number;
}

interface ExportData {
  moods: MoodEntry[];
  rituals: RitualEntry[];
  profile: ProfileStats;
  dateRange: { start: string; end: string };
}

export const exportProgressPDF = (data: ExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('EmbraceU Progress Report', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.profile.nickname}'s Journey`, pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `${data.dateRange.start} - ${data.dateRange.end}`,
    pageWidth / 2,
    42,
    { align: 'center' }
  );
  doc.setTextColor(0);

  // Stats Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, 55);
  
  const statsData = [
    ['Current Streak', `${data.profile.current_streak} days`],
    ['Longest Streak', `${data.profile.longest_streak} days`],
    ['Total Rituals', String(data.profile.total_rituals_completed)],
    ['Moods Logged', String(data.profile.total_moods_logged)],
    ['Patterns Released', String(data.profile.total_patterns_released)],
    ['Insights Saved', String(data.profile.total_insights_saved)],
  ];

  autoTable(doc, {
    startY: 60,
    head: [['Metric', 'Value']],
    body: statsData,
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] }, // Primary purple
    styles: { fontSize: 10, cellPadding: 4 },
    margin: { left: 14, right: 14 },
  });

  // Mood History
  const moodTableY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Mood History', 14, moodTableY);

  if (data.moods.length > 0) {
    const moodData = data.moods.slice(0, 20).map(m => [
      new Date(m.recorded_at).toLocaleDateString(),
      m.mood,
      (m.note || '-').substring(0, 50) + ((m.note?.length || 0) > 50 ? '...' : ''),
    ]);

    autoTable(doc, {
      startY: moodTableY + 5,
      head: [['Date', 'Mood', 'Note']],
      body: moodData,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No mood entries in this period.', 14, moodTableY + 10);
  }

  // Rituals Completed
  const ritualTableY = (doc as any).lastAutoTable?.finalY + 15 || moodTableY + 20;
  
  // Check if we need a new page
  if (ritualTableY > 250) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rituals Completed', 14, 20);
    
    if (data.rituals.length > 0) {
      const ritualData = data.rituals.slice(0, 20).map(r => [
        new Date(r.completed_at).toLocaleDateString(),
        r.ritual_type,
        r.duration_seconds ? `${Math.round(r.duration_seconds / 60)} min` : '-',
      ]);

      autoTable(doc, {
        startY: 25,
        head: [['Date', 'Type', 'Duration']],
        body: ritualData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 },
      });
    }
  } else {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rituals Completed', 14, ritualTableY);

    if (data.rituals.length > 0) {
      const ritualData = data.rituals.slice(0, 20).map(r => [
        new Date(r.completed_at).toLocaleDateString(),
        r.ritual_type,
        r.duration_seconds ? `${Math.round(r.duration_seconds / 60)} min` : '-',
      ]);

      autoTable(doc, {
        startY: ritualTableY + 5,
        head: [['Date', 'Type', 'Duration']],
        body: ritualData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 14, right: 14 },
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('No rituals completed in this period.', 14, ritualTableY + 10);
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated by EmbraceU • ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`embraceu-progress-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportDataCSV = (data: ExportData) => {
  const lines: string[] = [];
  
  // Header
  lines.push('EmbraceU Data Export');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`User: ${data.profile.nickname}`);
  lines.push('');
  
  // Profile Stats
  lines.push('=== Profile Statistics ===');
  lines.push('Metric,Value');
  lines.push(`Current Streak,${data.profile.current_streak} days`);
  lines.push(`Longest Streak,${data.profile.longest_streak} days`);
  lines.push(`Total Rituals,${data.profile.total_rituals_completed}`);
  lines.push(`Moods Logged,${data.profile.total_moods_logged}`);
  lines.push(`Patterns Released,${data.profile.total_patterns_released}`);
  lines.push(`Insights Saved,${data.profile.total_insights_saved}`);
  lines.push('');
  
  // Mood History
  lines.push('=== Mood History ===');
  lines.push('Date,Mood,Note');
  data.moods.forEach(m => {
    const note = (m.note || '').replace(/"/g, '""').replace(/\n/g, ' ');
    lines.push(`${m.recorded_at},"${m.mood}","${note}"`);
  });
  lines.push('');
  
  // Rituals
  lines.push('=== Rituals Completed ===');
  lines.push('Date,Type,Duration (seconds)');
  data.rituals.forEach(r => {
    lines.push(`${r.completed_at},"${r.ritual_type}",${r.duration_seconds || ''}`);
  });
  
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `embraceu-data-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
