import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

const BASE_URL = 'https://home-vision-challenge-d4dde1803160.herokuapp.com';

function App() {
    const [image, setImage] = useState(null);
    const [processedImageUrl, setProcessedImageUrl] = useState(null);
    const [totalDetections, setTotalDetections] = useState(null);
    const [checkBoxSize, setCheckboxSize] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [size, setSize] = useState('');

    const onDrop = (acceptedFiles) => {
        setImage(acceptedFiles[0]);
        setProcessedImageUrl(null);
        setTotalDetections(null);
        setCheckboxSize(null);
        setError(null);
        setSize('');
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
    });

    const handleSizeChange = (e) => {
        const value = e.target.value;
        if (value === '' || (value >= 1 && value <= 200)) {
            setSize(value);
        }
    };

    const handleGetRequest = async () => {
        setLoading(true);
        setProcessedImageUrl(null);
        try {
            // Always use size 24 when calling the API for testing with a sample image
            const url = `${BASE_URL}/checkbox?size=24`;
            const response = await axios.get(url);
            const { image_with_checkboxes_url, total_detections, checkbox_size_in_pixels } = response.data;
            const timestamp = new Date().getTime();
            setProcessedImageUrl(`${BASE_URL}${image_with_checkboxes_url}?t=${timestamp}`);
            setTotalDetections(total_detections);
            setCheckboxSize(checkbox_size_in_pixels);
            setError(null);
        } catch (err) {
            setError('Error fetching results. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostRequest = async () => {
        if (!image) {
            setError('Please upload an image.');
            return;
        }

        setLoading(true);
        setProcessedImageUrl(null);
        try {
            const formData = new FormData();
            formData.append('image', image);
            const url = size ? `${BASE_URL}/checkbox?size=${size}` : `${BASE_URL}/checkbox`;
            const response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { image_with_checkboxes_url, total_detections, checkbox_size_in_pixels } = response.data;
            const timestamp = new Date().getTime();
            setProcessedImageUrl(`${BASE_URL}${image_with_checkboxes_url}?t=${timestamp}`);
            setTotalDetections(total_detections);
            setCheckboxSize(checkbox_size_in_pixels);
            setError(null);
        } catch (err) {
            setError('There was an error processing image: ' + err.response.data + ' Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <header className="header">
                <h1>Checkbox Detection <span className="author">by Pablo Rodriguez Massuh</span></h1>
            </header>
            <div className="main-content">
                <div className="how-to-use">
                    <div className="how-to-use-column">
                        <h3>Option 1: Upload Your Own Image</h3>
                        <p>1. <strong>Select a jpg image</strong>: Drag and drop an image or click the box below to select
                            one.</p>
                        <p>2. <strong>Optionally choose checkbox size</strong>: You can choose the size of the checkbox
                            to detect, default is 24px.</p>
                        <p>3. <strong>Click 'Analyze'</strong>: After selecting your image, scroll down and click on the
                            'Analyze' button.</p>
                        <p>4. <strong>View results</strong>: The processed image will be displayed with the detected
                            checkboxes highlighted, along with the total number of checkboxes detected. If no checkboxes
                            are detected, try adjusting the size settings.</p>
                    </div>
                    <div className="how-to-use-column">
                        <h3>Option 2: Test with Sample Image</h3>
                        <p>1. <strong>Click 'Test with Sample Image'</strong>: Test the API with a default sample image.
                        </p>
                        <p>2. <strong>View results</strong>: You will see the processed image with the detected
                            checkboxes highlighted along with the total number of checkboxes detected.</p>
                        <button className="btn-test" onClick={handleGetRequest}
                                disabled={loading}>{loading ? 'Processing...' : 'Test with Sample Image ->'}</button>
                    </div>
                </div>
                <div className="container">
                    <div className="column upload-column">
                        <div {...getRootProps()} className="dropzone">
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <p>Drop the image here...</p>
                            ) : (
                                <p>Drag an image here or click to select</p>
                            )}
                        </div>
                        {image && (
                            <div className="image-preview">
                                <img src={URL.createObjectURL(image)} alt="Preview" className="aligned-image"/>
                                <div className="size-input-container">
                                    <label htmlFor="size-input">Size (optional, 1-200):</label>
                                    <input id="size-input" type="number" min="1" max="200" value={size}
                                           onChange={handleSizeChange} placeholder="Enter size" className="size-input"/>
                                    <button className="btn-analyze" onClick={handlePostRequest}
                                            disabled={loading}>{loading ? 'Processing...' : '🔍 Analyze'}</button>
                                </div>
                            </div>
                        )}
                        {error && <p className="error">{error}</p>}
                    </div>

                    <div className="column result-column">
                        {processedImageUrl && (
                            <div className="result-box">
                                <h3>Processed Image</h3>
                                <ul>
                                    {totalDetections !== null &&
                                        <li>Total checkboxes detected: <strong>{totalDetections}</strong></li>}
                                    {checkBoxSize !== null &&
                                        <li>Checkbox size in px: <strong>{checkBoxSize}</strong></li>}
                                </ul>
                                <img
                                    src={processedImageUrl}
                                    alt="Processed image with detected checkboxes"
                                    className="aligned-image larger-processed-image"
                                />
                                <div className="legend">
                                    <h4>Legend:</h4>
                                    <div className="legend-items">
                                        <div className="legend-item">
                                            <div
                                                className="color-box"
                                                style={{backgroundColor: 'rgba(0, 180, 90, 1)'}}
                                            />
                                            <span>Checked</span>
                                        </div>
                                        <div className="legend-item">
                                            <div
                                                className="color-box"
                                                style={{backgroundColor: 'rgba(220, 50, 50, 1)'}}
                                            />
                                            <span>Unchecked</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;