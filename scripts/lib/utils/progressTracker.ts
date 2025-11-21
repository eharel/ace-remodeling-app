/**
 * Progress Tracker
 *
 * Tracks and displays upload progress with ETA calculations.
 *
 * @module scripts/lib/utils/progressTracker
 */

/**
 * Progress statistics
 */
export interface ProgressStats {
  /** Total number of files */
  total: number;
  /** Number of successfully completed files */
  completed: number;
  /** Number of failed files */
  failed: number;
  /** Number of skipped files */
  skipped: number;

  /** Total bytes to upload */
  totalBytes: number;
  /** Bytes uploaded so far */
  uploadedBytes: number;

  /** Start time timestamp */
  startTime: number;
  /** Elapsed time in milliseconds */
  elapsedTime: number;
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining: number;

  /** Current file being processed */
  currentFile?: string;
}

/**
 * Progress tracker for file uploads
 *
 * Tracks upload progress, calculates ETA, and displays real-time updates.
 */
export class ProgressTracker {
  private stats: ProgressStats;

  /**
   * Create a new progress tracker
   *
   * @param totalFiles - Total number of files to upload
   * @param totalBytes - Total size in bytes
   */
  constructor(totalFiles: number, totalBytes: number) {
    this.stats = {
      total: totalFiles,
      completed: 0,
      failed: 0,
      skipped: 0,
      totalBytes,
      uploadedBytes: 0,
      startTime: Date.now(),
      elapsedTime: 0,
      estimatedTimeRemaining: 0,
    };
  }

  /**
   * Mark a file as completed
   *
   * @param filename - Name of completed file
   * @param bytes - Size of file in bytes
   */
  fileCompleted(filename: string, bytes: number): void {
    this.stats.completed++;
    this.stats.uploadedBytes += bytes;
    this.stats.currentFile = filename;
    this.updateEstimates();
    this.logProgress();
  }

  /**
   * Mark a file as failed
   *
   * @param filename - Name of failed file
   */
  fileFailed(filename: string): void {
    this.stats.failed++;
    this.stats.currentFile = filename;
    this.logProgress();
  }

  /**
   * Mark a file as skipped
   *
   * @param filename - Name of skipped file
   */
  fileSkipped(filename: string): void {
    this.stats.skipped++;
    this.stats.currentFile = filename;
    this.logProgress();
  }

  /**
   * Update time estimates based on current progress
   */
  private updateEstimates(): void {
    this.stats.elapsedTime = Date.now() - this.stats.startTime;

    const percentComplete = this.stats.uploadedBytes / this.stats.totalBytes;
    if (percentComplete > 0 && percentComplete < 1) {
      const totalEstimated = this.stats.elapsedTime / percentComplete;
      this.stats.estimatedTimeRemaining = Math.max(
        0,
        totalEstimated - this.stats.elapsedTime
      );
    } else {
      this.stats.estimatedTimeRemaining = 0;
    }
  }

  /**
   * Log current progress to console
   * Uses carriage return to overwrite same line
   */
  private logProgress(): void {
    const percent = ((this.stats.completed / this.stats.total) * 100).toFixed(
      1
    );
    const speed = this.calculateSpeed();
    const eta = this.formatTime(this.stats.estimatedTimeRemaining);

    // Truncate filename if too long
    const displayFile =
      this.stats.currentFile && this.stats.currentFile.length > 50
        ? "..." + this.stats.currentFile.slice(-47)
        : this.stats.currentFile || "";

    // Use carriage return to overwrite same line
    process.stdout.write(
      `\r📤 Uploading: ${this.stats.completed}/${this.stats.total} (${percent}%) | ` +
        `${speed} | ETA: ${eta} | ${displayFile}`.padEnd(120)
    );
  }

  /**
   * Calculate upload speed
   *
   * @returns Formatted speed string (MB/s or KB/s)
   */
  private calculateSpeed(): string {
    const mbUploaded = this.stats.uploadedBytes / (1024 * 1024);
    const secondsElapsed = this.stats.elapsedTime / 1000;

    if (secondsElapsed === 0) {
      return "0 KB/s";
    }

    const mbPerSecond = mbUploaded / secondsElapsed;

    if (mbPerSecond > 1) {
      return `${mbPerSecond.toFixed(2)} MB/s`;
    } else {
      return `${(mbPerSecond * 1024).toFixed(0)} KB/s`;
    }
  }

  /**
   * Format milliseconds to readable time string
   *
   * @param ms - Milliseconds
   * @returns Formatted time string (e.g., "4m 23s")
   */
  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m ${seconds % 60}s`;
    }

    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  /**
   * Get final statistics
   *
   * @returns Copy of current stats
   */
  getStats(): ProgressStats {
    return { ...this.stats };
  }

  /**
   * Print final summary to console
   */
  printSummary(): void {
    console.log("\n\n📊 Upload Summary:");
    console.log(`   ✅ Completed: ${this.stats.completed}`);
    console.log(`   ❌ Failed: ${this.stats.failed}`);
    console.log(`   ⏭️  Skipped: ${this.stats.skipped}`);
    console.log(`   📦 Total: ${this.stats.total}`);
    console.log(
      `   💾 Uploaded: ${formatBytes(this.stats.uploadedBytes)}`
    );
    console.log(`   ⏱️  Time: ${this.formatTime(this.stats.elapsedTime)}`);
  }
}

/**
 * Format bytes to human-readable size
 *
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.23 MB")
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

