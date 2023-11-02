import numpy as np
import matplotlib.pyplot as plt
from scipy.io import loadmat
from scipy.fft import ifft
import matplotlib as mpl


# Data type
#csi[Tx_index,Rx_index, subcarrier_index, packet_index]
#Tx_index: Since Wi-Fi can use MIMO, we use 2Tx for data acquisition
#Rx_index: Since Wi-Fi can use MIMO, we use 3Rx for data acquisition
#subcarrier_index: Wi-Fi system is based on OFDM. We only access 30 subcarriers
#packet_index: collected CSI over time, sampling freq. is 1000Hz.


# channel state information (CSI viewer)
# brief: CSI is a sampled version of the channel frequency response (CFR).
#TODO
def CSI_plot(csi, plot_subcarrier_all=True,tx_index=0,rx_index=0):
    packet_length = csi.shape[3]

    magnitude_series = []
    phase_series = []
    for i in range(packet_length):
        # Extract the specific CSI data
        csi_data = np.squeeze(csi[tx_index, rx_index, :, i])

        # Calculate Magnitude and Phase
        magnitude = np.abs(csi_data)
        phase = np.angle(csi_data)

        magnitude_series.append(magnitude)
        phase_series.append(phase)

    magnitude_matrix = np.column_stack(magnitude_series)
    phase_matrix = np.column_stack(phase_series)

    x = np.arange(1, packet_length + 1)
    y = np.arange(1, magnitude_matrix.shape[0] + 1)
    Time, Frequency = np.meshgrid(x, y)

    # Magnitude
    fig, ax = plt.subplots()
    if plot_subcarrier_all:
        c = ax.pcolormesh(Time, Frequency, magnitude_matrix, shading='auto', cmap='viridis')
        fig.colorbar(c, ax=ax)
    else:
        for i in range(magnitude_matrix.shape[0]):
            ax.plot(x, magnitude_matrix[i, :])

    ax.set_title('CSI Magnitude over Time')
    ax.set_xlabel('Packet Index')
    ax.set_ylabel('Subcarrier Index')

    plt.show()

    # Phase
    fig, ax = plt.subplots()
    if plot_subcarrier_all:
        c = ax.pcolormesh(Time, Frequency, phase_matrix, shading='auto', cmap='viridis')
        fig.colorbar(c, ax=ax)
    else:
        for i in range(phase_matrix.shape[0]):
            ax.plot(x, phase_matrix[i, :])

    ax.set_title('CSI Phase over Time')
    ax.set_xlabel('Packet Index')
    ax.set_ylabel('Subcarrier Index')

    plt.show()




# channel impluse response (CIR viewer)
# brief: CSI is a IFFT version of the channel frequency response (CFR).
# TODO
def CIR_plot(csi,tx_index=0,rx_index=0):
    # Configuration params
    num_taps = 30  # fixed, used all of  sub-carriers
    packet_length = csi.shape[3]

    CIR = []
    for i in range(packet_length):
        # Extract the specific CSI data
        csi_data = np.squeeze(csi[tx_index, rx_index, :, i])
        # Perform the inverse fast fourier transform (IFFT)
        cir = np.abs(ifft(csi_data, num_taps))
        i_cir = np.real(ifft(csi_data, num_taps)) #in-phase data
        q_cir = np.imag(ifft(csi_data, num_taps)) #quadrature data
        CIR.append(cir)

    CIR_matrix = np.column_stack(CIR)

    x = np.arange(1, packet_length + 1)
    y = np.arange(1, num_taps + 1)
    Time, Frequency = np.meshgrid(x, y)

    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    ax.plot_surface(Time, Frequency, CIR_matrix, edgecolor='none')
    ax.view_init(30, 30)  # you can adjust viewing angle

    ax.set_xlabel('Packet Index')
    ax.set_ylabel('Power Delay Profile')
    ax.set_zlabel('CIR Magnitude')
    ax.set_title('CIR series')

    mpl.rcParams['font.size'] = 15
    mpl.rcParams['font.family'] = 'Times New Roman'

    plt.show()






if __name__ == "__main__":
    # Load the .mat file
    mat = loadmat('cfall2_csi.mat')
    csi = mat['csi']  # Assuming the variable name in .mat file is 'csi'

    tx_index = 0
    rx_index = 2

    #CSI_plot(csi, True,tx_index,rx_index) #plot type 1
    #CSI_plot(csi, False,tx_index,rx_index) #plot type 2

    CIR_plot(csi,tx_index,rx_index) #time domain data, CIR=IFFT{CSI}
