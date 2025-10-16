

import os, shutil, random
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

# ================================
# Helper: tạo thư mục an toàn
# ================================
def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

# ================================
# Chia dataset train/val/test
# ================================
def split(cat: str):
    source = f"archive/rice_leaf_diseases/{cat}"

    train = f"working/dataset/train/{cat}"
    validation = f"working/dataset/validation/{cat}"
    test = f"working/dataset/test/{cat}"

    for d in [train, validation, test]:
        ensure_dir(d)

    images = os.listdir(source)
    random.shuffle(images)

    total = len(images)
    train_count = int(total * 0.8)
    val_count   = int(total * 0.1)
    # phần còn lại cho test để không lệch do làm tròn
    # test_count = total - train_count - val_count

    for idx, image in enumerate(images):
        src = os.path.join(source, image)
        if idx < train_count:
            dst = os.path.join(train, image)
        elif idx < train_count + val_count:
            dst = os.path.join(validation, image)
        else:
            dst = os.path.join(test, image)
        shutil.copy(src, dst)

# ================================
# Chia dữ liệu cho 3 lớp
# ================================
cats = ["Bacterial leaf blight", "Brown spot", "Leaf smut"]
for cat in cats:
    split(cat)

# ================================
# Tạo cấu trúc thư mục output
# ================================
ensure_dir('working/model/vgg/stage1')
ensure_dir('working/figures')

# ================================
# Chuẩn bị dữ liệu
# ================================
train_dir = "working/dataset/train/"
valid_dir = "working/dataset/validation/"
test_dir  = "working/dataset/test/"

train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
    rescale=1/255,
    rotation_range=45,
    zoom_range=0.3,
    horizontal_flip=True,
    fill_mode='nearest',
    height_shift_range=0.2,
    width_shift_range=0.2,
)
valid_datagen = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1/255)
test_datagen  = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1/255)

train_generator = train_datagen.flow_from_directory(
    train_dir, batch_size=32, class_mode='categorical', target_size=(256, 256)
)
valid_generator = valid_datagen.flow_from_directory(
    valid_dir, batch_size=32, class_mode='categorical', target_size=(256, 256)
)
test_generator = test_datagen.flow_from_directory(
    test_dir, batch_size=32, class_mode='categorical', target_size=(256, 256), shuffle=False
)

# Biểu đồ phân bố mẫu
train_counts = np.bincount(train_generator.classes)
valid_counts = np.bincount(valid_generator.classes)
test_counts  = np.bincount(test_generator.classes)
class_labels = list(train_generator.class_indices.keys())

x = np.arange(len(class_labels)); width = 0.25
plt.bar(x - width, train_counts, width, label='Train')
plt.bar(x,         valid_counts, width, label='Validation')
plt.bar(x + width, test_counts,  width, label='Test')
plt.xlabel('Classes'); plt.ylabel('Number of Samples')
plt.title('Class Distribution (Train/Val/Test)')
plt.xticks(x, class_labels, rotation=45); plt.legend(); plt.tight_layout()
plt.savefig('working/figures/data_distribution.png', dpi=300, bbox_inches='tight'); plt.close()

# ================================
# Learning Rate Scheduler
# ================================
def scheduler(epoch, lr):
    if epoch % 10 == 0 and epoch:
        return lr * (1 - 0.05)
    return lr
lr_scheduler = tf.keras.callbacks.LearningRateScheduler(scheduler)

# ================================
# Head (FC layers)
# ================================
def head(x_input):
    x = tf.keras.layers.Flatten()(x_input)
    x = tf.keras.layers.Dense(1024, activation='relu',
                              kernel_regularizer=tf.keras.regularizers.l2(0.01),
                              kernel_initializer='he_uniform')(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dropout(0.5)(x)
    x = tf.keras.layers.Dense(512, activation='relu',
                              kernel_regularizer=tf.keras.regularizers.l2(0.0075),
                              kernel_initializer='he_uniform')(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Dropout(0.5)(x)
    x = tf.keras.layers.Dense(3, activation='softmax')(x)
    return x

# ================================
# VGG16
# ================================
vgg16_base = tf.keras.applications.VGG16(weights='imagenet', include_top=False, input_shape=(256, 256, 3))
checkpoint_vgg = tf.keras.callbacks.ModelCheckpoint(
    filepath='working/model/vgg/checkpoint.weights.h5',
    save_weights_only=True, monitor='val_accuracy', mode='max', save_best_only=True
)

vgg16_base.trainable = False
vgg16_model = tf.keras.Model(vgg16_base.input, head(vgg16_base.output))
vgg16_model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
                    loss='categorical_crossentropy', metrics=['accuracy'])
historyvgg1 = vgg16_model.fit(
    train_generator, validation_data=valid_generator,
    epochs=50, batch_size=32, callbacks=[lr_scheduler, checkpoint_vgg]
)

plt.plot(historyvgg1.history['accuracy'])
plt.plot(historyvgg1.history['val_accuracy'])
plt.title('VGG16 Accuracy'); plt.legend(['Train', 'Validation'])
plt.savefig('working/figures/vgg16_acc_valacc.png', dpi=300, bbox_inches='tight'); plt.close()

# Lưu model/weights
vgg16_model.save_weights('working/model/vgg/stage1/vgg16_model1.weights.h5')
vgg16_model.save('working/model/vgg/stage1/vgg16_model.keras')  # chuẩn Keras mới (không cảnh báo HDF5)

# Evaluate + báo cáo
vgg16_model.load_weights('working/model/vgg/checkpoint.weights.h5')
test_loss, test_accuracy = vgg16_model.evaluate(test_generator)
print(f"✅ VGG16 Test Accuracy: {test_accuracy:.2f}")

y_pred_probs = vgg16_model.predict(test_generator)
y_pred = y_pred_probs.argmax(axis=1)
y_true = test_generator.classes
report = classification_report(y_true, y_pred, target_names=class_labels)
print(report)

cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=class_labels, yticklabels=class_labels)
plt.xlabel('Predicted'); plt.ylabel('True'); plt.title('VGG16 Confusion Matrix')
plt.savefig('working/figures/vgg16_cm.png', dpi=300, bbox_inches='tight'); plt.close()

print("🎉 Training complete (VGG16 only). Results saved to 'working/' folder.")
